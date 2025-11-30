import json
import sys

import requests
from datetime import datetime
from parsers import parse_location_lines


# def transform_shutdown_data(shutdown_list):
#     """
#     Transforms the raw shutdown list into a nested dictionary structured by
#     voivodeship (deptName) and city (regionName).
#
#     Uses the modified parsing functions to correctly extract buildings.
#     """
#     transformed_data = {}
#
#     oddzial_voievodship_map = {
#         "Gdańsk": "Pomorskie",
#         "Kalisz": "Wielkopolskie",
#         "Koszalin": "Zachodniopomorskie",
#         "Olsztyn": "Warmińsko-mazurskie",
#         "Płock": "Mazowieckie",
#         "Toruń": "Kujawsko-pomorskie",
#     }
#
#     messages = []
#
#     for shutdown in shutdown_list:
#         try:
#             voivodeship = oddzial_voievodship_map[shutdown.get('deptName')]
#             city = shutdown.get('regionName')  # This is the "city" level from the request
#             message = shutdown.get('message')
#             hours_list = shutdown.get('hours', [])
#
#             print(hours_list)
#
#             print(message, end='\n\n')
#
#             messages.append(message)
#
#             if not all([voivodeship, city, message, hours_list]):
#                 print(f"Skipping entry guid {shutdown.get('guid')}: missing essential data.")
#                 continue
#
#             first_hour_slot = hours_list[0]
#             from_date = first_hour_slot.get('fromDate')
#             to_date = first_hour_slot.get('toDate')
#
#             if not from_date or not to_date:
#                 print(f"Skipping entry guid {shutdown.get('guid')}: missing time data.")
#                 continue
#
#             shutdown_details = {
#                 "interval": {
#                     "from_date": from_date,
#                     "to_date": to_date,
#                 },
#                 # "locations": parse_locations(message),
#             }
#
#             if voivodeship not in transformed_data:
#                 transformed_data[voivodeship] = {}
#
#             if city not in transformed_data[voivodeship]:
#                 transformed_data[voivodeship][city] = []
#
#             transformed_data[voivodeship][city].append(shutdown_details)
#
#         except Exception as e:
#             print(f"Error processing shutdown guid {shutdown.get('guid')}: {e}")
#
#     print(f"Retrieved and parsed {len(messages)} amount of messages aka location lines")
#
#     return transformed_data


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

    # --- Phase 1: Data Validation & Collection ---
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
            print(f"Error preparing shutdown guid {shutdown.get('guid')}: {e}")

    # --- Phase 2: Batch Parsing & Reassembly ---

    if not messages_to_parse:
        return transformed_data

    # Send all messages to LLM.
    # Expected result: A list where index i matches messages_to_parse[i].
    # Each item in the list should be a collection (list/root) of towns found in that message.
    parsed_results = parse_location_lines(messages_to_parse)

    # Use zip to pair the specific date/voivodeship with the parsed locations
    for context, parsed_location_obj in zip(valid_contexts, parsed_results):

        voivodeship = context["voivodeship"]

        # 1. Convert Pydantic models to native Python list/dict
        parsed_data = parsed_location_obj
        if hasattr(parsed_location_obj, 'model_dump'):
            parsed_data = parsed_location_obj.model_dump()
        elif hasattr(parsed_location_obj, 'dict'):
            parsed_data = parsed_location_obj.dict()

        # 2. Normalize parsed_data to a list of towns
        # Handles cases where the parser returns a wrapper object (like .root) or a direct list
        towns_list = []
        if isinstance(parsed_data, list):
            towns_list = parsed_data
        elif isinstance(parsed_data, dict):
            # If it returns a dict with a 'root' key or similar
            towns_list = parsed_data.get('root', [parsed_data])

        # 3. Iterate over EVERY town found in this single message line.
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
