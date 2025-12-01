import asyncio
import sys
import re

from langchain_core.runnables import RunnableLambda
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import json
from json_repair import repair_json

from Microservice.scrapers.parsers.models import TownsAndLocations
from Microservice.scrapers.parsers.prompts import location_lines_parsing_prompt

from dotenv import load_dotenv

load_dotenv()


def repair_json_wrapper(ai_output) -> str:
    text = ai_output.content if hasattr(ai_output, "content") else str(ai_output)
    try:
        return repair_json(text)
    except Exception as e:
        print(f"JSON repair failed: {e}")
        return "{}"


# Initialize Groq LLM
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile",
    temperature=0
)

pydantic_parser = PydanticOutputParser(pydantic_object=TownsAndLocations)

# Define prompt
prompt = ChatPromptTemplate.from_messages(
    [("system", location_lines_parsing_prompt), ("human", "{input}")]
).partial(format_instructions=pydantic_parser.get_format_instructions())

chain = prompt | llm | RunnableLambda(repair_json_wrapper) | pydantic_parser


def expand_polish_range(text: str) -> list[str]:
    """
    Parses 'od 72 do 74' or '72-74' and returns ['72', '73', '74'].
    Returns [text] if no range is detected.
    """

    match_od_do = re.search(r'od\s+(\d+)\s+do\s+(\d+)', text, re.IGNORECASE)

    match_dash = re.search(r'^(\d+)-(\d+)$', text.strip())

    start, end = None, None

    if match_od_do:
        start, end = int(match_od_do.group(1)), int(match_od_do.group(2))
    elif match_dash:
        start, end = int(match_dash.group(1)), int(match_dash.group(2))

    if start is not None and end is not None:
        if 0 < (end - start) < 50:
            return [str(i) for i in range(start, end + 1)]

    return [text]


async def parse_batches_with_llm(text_chunks: list[list[str]], max_concurrency: int = 40, retry_num: int = 0):
    """
    Async batch processing with automatic regex cleanup for 'od X do Y' ranges
    that the LLM might have missed. Handles both flat and nested JSON structures.
    """
    batch_inputs = [
        {"input": json.dumps([line.strip() for line in chunk], ensure_ascii=False)}
        for chunk in text_chunks
    ]

    try:
        # Run the batch using async abatch
        results: list[TownsAndLocations] = await chain.abatch(
            batch_inputs,
            config={"max_concurrency": max_concurrency},
            return_exceptions=False
        )

        parsed_data = []

        # Expanding unexpanded ranges
        for res, batch_input in zip(results, batch_inputs):
            chunk_entries = res.model_dump()

            if isinstance(chunk_entries, dict) and 'root' in chunk_entries:
                chunk_entries = chunk_entries['root']

            for entry in chunk_entries:
                if isinstance(entry, list):
                    towns_list = entry
                else:
                    towns_list = [entry]

                for town_entry in towns_list:
                    if isinstance(town_entry, dict):
                        for town_name, town_data in town_entry.items():
                            if isinstance(town_data, dict) and "locations" in town_data and isinstance(
                                    town_data["locations"], list):
                                raw_locs = town_data["locations"]
                                cleaned_locs = []

                                for loc in raw_locs:
                                    if isinstance(loc, str):
                                        cleaned_locs.extend(expand_polish_range(loc))
                                    else:
                                        cleaned_locs.append(loc)

                                town_data["locations"] = cleaned_locs

            lines = json.loads(batch_input["input"])
            num_lines = len(lines)

            if len(chunk_entries) != num_lines:
                print(
                    "ERROR: Model parsed lines into more or less sublists than expected. Extending parsed_data with empty dicts.")
                parsed_data.extend([{} for _ in range(num_lines)])

                print(f'Chunk entries: {len(chunk_entries)}     Batch input lines: {num_lines}')

                print(json.dumps(chunk_entries, indent=4, ensure_ascii=False), end="\n\n")

                print(json.dumps(batch_input, indent=4, ensure_ascii=False),
                      end="\n\n ------------NEXT ONE--------------\n")

                if retry_num < 5:
                    print(f"Batch parsing failed, recursive retry in 5 seconds")
                    retry_num += 1
                    await asyncio.sleep(5)
                    return await parse_batches_with_llm(text_chunks, max_concurrency=max_concurrency,
                                                        retry_num=retry_num)
                else:
                    print(f"Batch parsing failed and limit for recursive retryings as well, so returning empty list")
                    return []
            else:
                parsed_data.extend(chunk_entries)

        return parsed_data

    except Exception as e:
        print(f"Batch parsing failed: {e}, recursive retry in 5 seconds")
        await asyncio.sleep(5)
        return await parse_batches_with_llm(text_chunks, max_concurrency=max_concurrency)


def parse_location_lines(location_lines: list[str], max_concurrency: int = 40, lines_per_chunk: int = 20) -> list:
    """
    Batches lines into text blocks, sends to LLM, returns list of results
    matching 1-to-1 with input lines - one line of input = one sublist of results

    Example:
        ""Parzew od 7 do 9, 43, 43A, od 44 do 46, .-203/5, 185, Sławoszew .""

        Equals to

        [
          {"Parzew": {"locations": [...]}},
          {"Sławoszew": {"locations": [...]}}
       ]
    """
    chunked_inputs = []
    for i in range(0, len(location_lines), lines_per_chunk):
        chunk = location_lines[i: i + lines_per_chunk]
        chunked_inputs.append(chunk)

    print(f"Split {len(location_lines)} lines into {len(chunked_inputs)} chunks.")

    res = asyncio.run(parse_batches_with_llm(chunked_inputs, max_concurrency))

    return res


if __name__ == "__main__":
    chunk_example = """
    Parzew od 7 do 9, 43, 43A, od 44 do 46, .-203/5, 185, Sławoszew .
    Parzew 1, od 3 do 6, 32, 37A, od 38 do 42, 42A, 165, 203/1, Sławoszew 1, od 11 do 26, 26A, 27, od 30 do 34, od 36 do 38, 38B, 39, od 41 do 48, 50, 235/2, 255/1.
    Parzew 40, Sławoszew 54, od 56 do 61, od 63 do 66, od 68 do 73, od 75 do 81, od 83 do 85, 87, 88, 90, 91, od 93 do 98, od 100 do 102, 106, 114, 59 (MDZ).
    Parzew , 264, Sławoszew 2, 3, 3A, od 4 do 6, 6a, od 7 do 10, 11A, od 51 do 53, 154/4, 167/5, ST 47-127.
    Parzew od 18 do 21, 21A, 24, .-44/1.
    Lubinia Mała od 38 do 45, 45A, 46, 458, 459/1.
    Parzew od 10 do 13, 16, 17, .-218/2, 127, 126.
    Lubinia Mała od 48 do 52, dz. nr-428.
    Lubinia Mała 69, od 91 do 96, 96A, 98, 99, 99A, 100, 100 C, 100B, 100D, 510, 514/25, 518, 518/20.
    Parzew .
    
    Lubinia Mała 53, 54, 54A, 54B, 55, 56, 56 B, 56A, 57, 57A, 65A, 66, 67, 67a, 68, 71, 71A, 72, 73, 73A, od 74 do 77, --363/2, dz. nr-258, 259, dz. nr-350, dz. nr-363/5, Sucha 8, 9.
    Przyborów.
    """

    loc_lines = [
        "Parzew od 7 do 9, 43, 43A, od 44 do 46, .-203/5, 185, Sławoszew .",
        "Parzew 1, od 3 do 6, 32, 37A, od 38 do 42, 42A, 165, 203/1, Sławoszew 1, od 11 do 26, 26A, 27, od 30 do 34, od 36 do 38, 38B, 39, od 41 do 48, 50, 235/2, 255/1.",
        "Parzew 40, Sławoszew 54, od 56 do 61, od 63 do 66, od 68 do 73, od 75 do 81, od 83 do 85, 87, 88, 90, 91, od 93 do 98, od 100 do 102, 106, 114, 59 (MDZ).",
        "Parzew , 264, Sławoszew 2, 3, 3A, od 4 do 6, 6a, od 7 do 10, 11A, od 51 do 53, 154/4, 167/5, ST 47-127.",
        "Parzew od 18 do 21, 21A, 24, .-44/1.",
        "Lubinia Mała od 38 do 45, 45A, 46, 458, 459/1.",
        "Parzew od 10 do 13, 16, 17, .-218/2, 127, 126.",
        "Lubinia Mała od 48 do 52, dz. nr-428.",
        "Lubinia Mała 69, od 91 do 96, 96A, 98, 99, 99A, 100, 100 C, 100B, 100D, 510, 514/25, 518, 518/20.",
        "Parzew .",
        "Lubinia Mała 53, 54, 54A, 54B, 55, 56, 56 B, 56A, 57, 57A, 65A, 66, 67, 67a, 68, 71, 71A, 72, 73, 73A, od 74 do 77, --363/2, dz. nr-258, 259, dz. nr-350, dz. nr-363/5, Sucha 8, 9.",
        "Przyborów."
    ]

    res = parse_location_lines(loc_lines)

    json.dump(res, sys.stdout, indent=4, ensure_ascii=False)
