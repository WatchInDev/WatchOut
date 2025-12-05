import asyncio
import os
import re
import json

from dotenv import load_dotenv
from langchain_core.runnables import RunnableLambda
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from json_repair import repair_json

try:
    # Try importing from local modules (Azure/Production context)
    from .models import TownsAndLocations
    from .prompts import location_lines_parsing_prompt
except ImportError:
    from models import TownsAndLocations
    from prompts import location_lines_parsing_prompt

load_dotenv()


def repair_json_wrapper(ai_output) -> str:
    text = ai_output.content if hasattr(ai_output, "content") else str(ai_output)
    try:
        return repair_json(text)
    except Exception as e:
        print(f"JSON repair failed: {e}")
        return "[]"  # Return empty list string for RootModel defaulting


# Global variable to cache the chain
_chain_cache = None


def get_chain():
    global _chain_cache
    if _chain_cache:
        return _chain_cache

    llm = ChatGroq(
        model_name="llama-3.3-70b-versatile",
        # model_name="meta-llama/llama-4-maverick-17b-128e-instruct",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY")
    )

    pydantic_parser = PydanticOutputParser(pydantic_object=TownsAndLocations)

    prompt = ChatPromptTemplate.from_messages(
        [("system", location_lines_parsing_prompt), ("human", "{input}")]
    ).partial(format_instructions=pydantic_parser.get_format_instructions())

    _chain_cache = prompt | llm | RunnableLambda(repair_json_wrapper) | pydantic_parser
    return _chain_cache


def expand_polish_range(text: str) -> list[str]:
    """
    Parses 'od 72 do 74' or '72-74' and returns ['72', '73', '74'].
    Returns [text] if no range is detected.
    """
    if not isinstance(text, str):
        return [str(text)]

    match_od_do = re.search(r'od\s+(\d+)\s+do\s+(\d+)', text, re.IGNORECASE)
    match_dash = re.search(r'^(\d+)-(\d+)$', text.strip())

    start, end = None, None

    if match_od_do:
        start, end = int(match_od_do.group(1)), int(match_od_do.group(2))
    elif match_dash:
        start, end = int(match_dash.group(1)), int(match_dash.group(2))

    if start is not None and end is not None:
        return [str(i) for i in range(start, end + 1)]

    return [text]


async def parse_batches_with_llm(text_chunks: list[list[str]], max_concurrency: int = 40, retry_num: int = 0):
    """
    Async batch processing.
    Adapted for RootModel: list[dict[str, list[str]]]
    """
    batch_inputs = [
        {"input": json.dumps([line.strip() for line in chunk], ensure_ascii=False)}
        for chunk in text_chunks
    ]

    chain = get_chain()

    try:
        results: list[TownsAndLocations] = await chain.abatch(
            batch_inputs,
            config={"max_concurrency": max_concurrency},
            return_exceptions=False
        )

        parsed_data = []

        for res, batch_input in zip(results, batch_inputs):
            chunk_entries = res.root

            # --- POST-PROCESSING: Expand Ranges ---
            for line_entry in chunk_entries:
                # line_entry represents one line of text: {"Town": ["1", "2"], "Town2": ["5"]}
                if isinstance(line_entry, dict):
                    for town_name, locations in line_entry.items():
                        # Determine if locations is a list (expected) or single string (hallucination)
                        if isinstance(locations, list):
                            raw_locs = locations
                        else:
                            raw_locs = [str(locations)]

                        cleaned_locs = []
                        for loc in raw_locs:
                            cleaned_locs.extend(expand_polish_range(loc))

                        # Update the list in place
                        line_entry[town_name] = cleaned_locs

            # --- VALIDATION ---
            lines = json.loads(batch_input["input"])
            num_lines = len(lines)

            if len(chunk_entries) != num_lines:
                print(
                    "ERROR: Model parsed lines into more or less sublists than expected. "
                    "Extending/Truncating to match line count."
                )
                print(f'Chunk entries: {len(chunk_entries)} vs Input lines: {num_lines}')

                # Debug Output
                print(json.dumps(chunk_entries, indent=4, ensure_ascii=False), end="\n\n")

                if retry_num < 3:
                    print(f"Batch parsing mismatch, retrying... (Attempt {retry_num + 1}/3)")
                    await asyncio.sleep(2)
                    return await parse_batches_with_llm(
                        text_chunks,
                        max_concurrency=max_concurrency,
                        retry_num=retry_num + 1
                    )
                else:
                    # Fallback: fill missing with empty dicts or slice
                    if len(chunk_entries) < num_lines:
                        chunk_entries.extend([{} for _ in range(num_lines - len(chunk_entries))])
                    else:
                        chunk_entries = chunk_entries[:num_lines]

            parsed_data.extend(chunk_entries)

        return parsed_data

    except Exception as e:
        print(f"Batch parsing CRASH: {e}")
        if retry_num < 3:
            print("Recursive retry in 5 seconds...")
            await asyncio.sleep(5)
            return await parse_batches_with_llm(
                text_chunks,
                max_concurrency=max_concurrency,
                retry_num=retry_num + 1
            )
        print("Max retries reached. Returning empty list for this batch.")
        return []


def parse_location_lines(location_lines: list[str], max_concurrency: int = 40, lines_per_chunk: int = 15) -> list:
    """
    Batches lines into text blocks, sends to LLM, returns list of results.
    Output format: List of dicts, where each dict is { "TownName": ["loc1", "loc2"] }
    """
    chunked_inputs = []

    for i in range(0, len(location_lines), lines_per_chunk):
        chunk = location_lines[i: i + lines_per_chunk]
        chunked_inputs.append(chunk)

    print(f"Split {len(location_lines)} lines into {len(chunked_inputs)} chunks.")

    if not chunked_inputs:
        return []

    res = asyncio.run(parse_batches_with_llm(chunked_inputs, max_concurrency))
    return res


if __name__ == "__main__":
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

    print(json.dumps(res, indent=4, ensure_ascii=False))
