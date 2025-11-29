import sys

from langchain_core.runnables import RunnableLambda
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import json
from json_repair import repair_json

from Microservice.scrapers.parser.models import TownsAndLocations
from Microservice.scrapers.parser.prompts import location_lines_parsing_prompt

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
    temperature=0,

)

# Define the expected JSON structure
json_parser = PydanticOutputParser(pydantic_object=TownsAndLocations)

# Define prompt
prompt = ChatPromptTemplate.from_messages(
    [("system", location_lines_parsing_prompt), ("human", "{input}")]
).partial(format_instructions=json_parser.get_format_instructions())

chain = prompt | llm | RunnableLambda(repair_json_wrapper) | json_parser


def parse_batches_with_llm(text_blocks: list[str], max_concurrency: int = 10):
    batch_inputs = [{"input": block} for block in text_blocks]

    try:
        # Run the batch
        results = chain.batch(
            batch_inputs,
            config={"max_concurrency": max_concurrency},
            return_exceptions=False
        )

        parsed_data = []
        for res in results:
            # res.root is List[List[Dict]]. We extend the main list with these sub-lists.
            # So if the batch had 10 lines, res.root has 10 items.
            parsed_data.extend(res.root)

        return parsed_data
    except Exception as e:
        print(f"Batch parsing failed: {e}")
        # Return empty lists for the failed batch size if needed, or just []
        return []


def parse_location_lines(location_lines: list[str], max_concurrency: int = 10, lines_per_batch: int = 10) -> list:
    """
    Batches lines into text blocks, sends to LLM, returns flattened list of results
    matching 1-to-1 with input lines.
    """
    # --- Step 1: Create Chunks ---
    chunked_inputs = []
    for i in range(0, len(location_lines), lines_per_batch):
        chunk = location_lines[i: i + lines_per_batch]
        joined_text = "\n".join(chunk)
        chunked_inputs.append(joined_text)

    print(f"Compressed {len(location_lines)} lines into {len(chunked_inputs)} LLM requests.")

    # --- Step 2: Process ---
    # results will be a List of Lists (one inner list per input line)
    results = parse_batches_with_llm(chunked_inputs, max_concurrency)

    return results


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

    json.dump(res, sys.stdout, indent=4, ensure_ascii=False)
