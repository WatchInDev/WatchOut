import json
import sys

import requests
from datetime import datetime
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

    # Send all messages to LLM.
    parsed_results = parse_location_lines(messages_to_parse)

    # Use zip to pair the specific date/voivodeship with the parsed locations
    for context, towns_list in zip(valid_contexts, parsed_results):
        voivodeship = context["voivodeship"]

        # This handles the "Parzew..., Sławoszew..." case where one line = multiple cities.
        for town_entry in towns_list:

            # Assuming structure: [{"Parzew": ...details...}, {"Sławoszew": ...details...}]
            if isinstance(town_entry, dict):
                for town_name, location_details in town_entry.items():

                    # CRITICAL: We use the town name from the LLM as the "City"
                    city = town_name

                    shutdown_details = {
                        "interval": context["interval"],
                        "locations": location_details['locations']
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

# nToruń ulice Dojazd 43, Działowa 10, 12, 13, 13B, 13C, 14, 16A, 16B, 16C, 16D, 16G, 16J, 16K, 16Ł, 16M, 16N, 16O, 16P, 0054-46/2, 34/5.\n\nPokrzywy, Przykop.\n\nWołuszewo.\n\nCiechocinek ulice Sportowa, Wołuszewska.\n\nKępina 9, Koniecwałd 46, od 48 do 50.\n\nCzarne Małe 56C, Olszówka 1.\n\nGromoty 36, 36A, od 37 do 41, 0012-262/1 (MDZ), Tchórzanka 59.\n\nDrawsko Pomorskie ulica 11 Pułku Piechoty 55, 57, 59, 61, 63, 65, 67, 69, 71.'}
