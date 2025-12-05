import json
import sys

import requests
from datetime import datetime

try:
    # Try importing from local modules (Azure/Production context)
    from .parsers import parse_location_lines
except ImportError:
    from Microservice.scrapers.parsers import parse_location_lines


def transform_shutdown_data(shutdown_list):
    """
    Transforms the raw shutdown list into a nested dictionary structured by
    voivodeship (deptName) and city (parsed from message).

    Structure:
    Voivodeship -> City (Parsed) -> List of [ { interval: {...}, locations: [...] } ]
    """
    transformed_data = {}

    oddzial_voievodship_map = {
        "Gdańsk": "Pomorskie",
        "Kalisz": "Wielkopolskie",
        "Koszalin": "Zachodniopomorskie",
        "Olsztyn": "Warmińsko-mazurskie",
        "Płock": "Mazowieckie",
        "Toruń": "Kujawsko-pomorskie",
    }

    # Data Validation and Collection
    valid_contexts = []
    messages_to_parse = []

    for shutdown in shutdown_list:
        try:
            dept_name = shutdown.get('deptName')
            voivodeship = oddzial_voievodship_map.get(dept_name)

            # We still grab the regionName, but only as a fallback or reference.
            # We will primarily use the parsed town name later.
            original_city_region = shutdown.get('regionName')
            message = shutdown.get('message')
            hours_list = shutdown.get('hours', [])

            if not all([voivodeship, original_city_region, message, hours_list]):
                continue

            first_hour_slot = hours_list[0]
            from_date = first_hour_slot.get('fromDate')
            to_date = first_hour_slot.get('toDate')

            if not from_date or not to_date:
                continue

            # Context only stores metadata unrelated to the message content
            context = {
                "voivodeship": voivodeship,
                "interval": {
                    "from_date": from_date,
                    "to_date": to_date,
                }
            }

            valid_contexts.append(context)
            messages_to_parse.append(message)

        except Exception as e:
            print(f"Error preparing shutdown: {e}")

    # Batch Parsing and Reassembly

    if not messages_to_parse:
        return transformed_data

    # Parse address data by LLM
    parsed_results = parse_location_lines(messages_to_parse)

    # Reassemble
    for context, towns_list in zip(valid_contexts, parsed_results):
        voivodeship = context["voivodeship"]

        for town_dict in towns_list:
            if isinstance(town_dict, dict):
                for town_name, location_details in town_dict.items():
                    city = town_name

                    shutdown_details = {
                        "interval": context["interval"],
                        "locations": location_details
                    }

                    # Initialize structure if needed
                    if voivodeship not in transformed_data:
                        transformed_data[voivodeship] = {}

                    if city not in transformed_data[voivodeship]:
                        transformed_data[voivodeship][city] = []

                    transformed_data[voivodeship][city].append(shutdown_details)

    print(f"Energa: Retrieved and parsed {len(messages_to_parse)} messages.")

    print(messages_to_parse)

    return transformed_data


def get_energa_planned_shutdowns() -> dict[str, dict[str, dict[str, tuple[datetime, datetime]]]]:
    """
    voivodeship:
        - city:
            - interval
                - locations: []

    """

    url = "https://energa-operator.pl/__system/api/document/EXTERNAL_DOCUMENT-305647/1761313426"

    try:
        shutdown_list = requests.get(url).json()['document']['payload']['shutdowns']

        res = transform_shutdown_data(shutdown_list)
        return res

    except Exception as e:
        print(f'Error trying scraping shutdowns from Energa: {e}')
        raise e


if __name__ == '__main__':
    res = get_energa_planned_shutdowns()

    json.dump(res, sys.stdout, ensure_ascii=False, indent=4)
