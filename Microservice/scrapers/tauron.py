import os
import sys
from datetime import datetime, timezone, timedelta
import json

import requests

try:
    # Try importing from local modules (Azure/Production context)
    from .parsers import parse_location_lines
except ImportError:
    from Microservice.scrapers.parsers import parse_location_lines


def transform_shutdown_data(responses_and_voivodeships: list[tuple[dict, str]]) -> dict:
    """
    Transforms a list of Tauron API responses into the target nested dictionary
    using batch LLM parsing.

    Structure:
    Voivodeship -> City (Parsed) -> List of [ { interval: {...}, locations: [...] } ]
    """
    transformed_data = {}

    # Data Validation and Collection
    valid_contexts = []
    messages_to_parse = []

    for response, voivodeship in responses_and_voivodeships:
        outage_items = response.get('OutageItems', [])

        for item in outage_items:
            start_date = item.get('StartDate')
            end_date = item.get('EndDate')
            message = item.get('Message')

            if not all([start_date, end_date, message]):
                continue

            # Context stores metadata unrelated to the message content
            context = {
                "voivodeship": voivodeship,
                "interval": {
                    "from_date": start_date,
                    "to_date": end_date,
                }
            }

            valid_contexts.append(context)
            messages_to_parse.append(message)

    # Batch Parsing
    if not messages_to_parse:
        return transformed_data

    # Parse messages by LLM
    parsed_results = parse_location_lines(messages_to_parse)

    # Reassembly
    for context, towns_list in zip(valid_contexts, parsed_results):

        voivodeship = context["voivodeship"]

        # Iterate over EVERY town found in this single message line.
        for town_dict in towns_list:
            if isinstance(town_dict, dict):
                for town_name, location_details in town_dict.items():
                    city = town_name

                    shutdown_details = {
                        "interval": context["interval"],
                        "locations": location_details
                    }

                    # Initialize structure
                    if voivodeship not in transformed_data:
                        transformed_data[voivodeship] = {}

                    if city not in transformed_data[voivodeship]:
                        transformed_data[voivodeship][city] = []

                    transformed_data[voivodeship][city].append(shutdown_details)

    print(f"Tauron: Retrieved and parsed {len(messages_to_parse)} messages.")

    return transformed_data


def get_tauron_planned_shutdowns(from_date: datetime, to_date: datetime):
    """
    voivodeship:
        - city:
            - interval
                - locations: []

    """

    from_date = format_for_tauron(from_date)
    to_date = format_for_tauron(to_date)

    base_url = "https://www.tauron-dystrybucja.pl/waapi/outages/area?"

    current_dir = os.path.dirname(os.path.abspath(__file__))

    json_path = os.path.join(current_dir, 'source', 'tauron_voivodeship_powiat_map.json')

    voivodeship_powiat_GAID_map = json.load(open(json_path, 'r', encoding='utf-8'))

    responses_and_voivodeships = []

    for voivodeship_dict in voivodeship_powiat_GAID_map[:1]:
        voivodeship = list(voivodeship_dict['voivodeship'].keys())[0]
        voivodeship_GAID = list(voivodeship_dict['voivodeship'].values())[0]

        for district, district_GAID in voivodeship_dict['districts'].items():
            request_url = f"{base_url}&provinceGAID={voivodeship_GAID}&districtGAID={district_GAID}&fromDate={from_date}&toDate={to_date}"

            try:
                response = requests.get(request_url)
                resp_json = response.json()
                print(resp_json)

                responses_and_voivodeships.append((resp_json, voivodeship))
            except Exception as e:
                print(f"Exception making request to {request_url}:\n {e}")
                pass
    return transform_shutdown_data(responses_and_voivodeships)


# Convert to the required format: "YYYY-MM-DDTHH:MM:SS.sssZ"
def format_for_tauron(dt: datetime) -> str:
    # Keep UTC timezone, format with milliseconds and replace +00:00 → Z
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


if __name__ == "__main__":
    # infer_powiat_GAIDs()
    from_date = datetime(year=2025, month=12, day=1, tzinfo=timezone.utc)
    to_date = datetime(year=2025, month=12, day=7, tzinfo=timezone.utc)
    # res = get_tauron_planned_shutdowns(from_date, to_date)
    res = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))
    json.dump(res, sys.stdout, ensure_ascii=False, indent=4)
