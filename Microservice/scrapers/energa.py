import json
import re
import sys

from Microservice.logging_config import setup_loguru

setup_loguru()

from loguru import logger
import requests
from datetime import datetime


def parse_energa_locations(locations: str) -> tuple[str, list[tuple[str, str]]]:
    """
    Parse the energa locations string into:
    (city: str, buildings: list[tuple[street: str, building_number: str]])

    MODIFIED to correctly handle standalone streets/villages.
    """
    try:
        # Extract city name (everything before "ulice" or "ulica")
        city_match = re.match(r'^(.*?)\s+ulic[ae]\s+', locations)

        if city_match:
            city = city_match.group(1).strip()
            streets_text = locations[city_match.end():].strip()
        else:
            # No "ulice/ulica" - try to extract city from first capitalized word(s)
            city_match = re.match(
                r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[\s\-][A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*)\s*(?=\d|od\s|,|B/N|\.|$)',
                locations)
            if city_match:
                city = city_match.group(1).strip()
                streets_text = locations[city_match.end():].strip().lstrip(',').strip()
            else:
                logger.warning(f'Failed to parse city from locations: {locations}')
                return (locations, [])  # Return original string as "city" if all else fails

        buildings = []
        current_street = city  # Default to city if no street specified

        # Split by commas and process each part
        parts = [p.strip() for p in streets_text.split(',')]

        i = 0
        while i < len(parts):
            part = parts[i].rstrip('.').strip()

            if not part or part in ['-', '.', '--']:
                i += 1
                continue

            if part.startswith('od ') and 'do' not in part:
                range_start = part
                j = i + 1
                while j < len(parts) and 'do' not in parts[j]:
                    range_start += ', ' + parts[j].strip()
                    j += 1
                if j < len(parts):
                    range_start += ', ' + parts[j].strip()
                    buildings.extend(parse_building_numbers(current_street, range_start))
                    i = j + 1
                    continue

            # --- MODIFICATION ---
            # Original regex required numbers: r'^([A-Z...]*)\s+(.+)$'
            # New regex makes numbers optional: r'^([A-Z...]*)(?:\s+(.+))?$'
            street_match = re.match(
                r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[\s\-][A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*)(?:\s+(.+))?$',
                part)

            if street_match:
                potential_street = street_match.group(1).strip()
                # group(2) can be None if no numbers are present
                numbers_part = street_match.group(2).strip() if street_match.group(2) else ""

                if len(potential_street) >= 2 and not re.search(r'\d$', potential_street):
                    current_street = potential_street
                    buildings.extend(parse_building_numbers(current_street, numbers_part))
                else:
                    buildings.extend(parse_building_numbers(current_street, part))
            else:
                buildings.extend(parse_building_numbers(current_street, part))

            i += 1

        return (city, buildings)

    except Exception as e:
        logger.exception(f'Failed to parse locations: {locations}')
        return ("", [])


# --- User-provided function with modifications ---

def parse_building_numbers(street: str, numbers_str: str) -> list[tuple[str, str]]:
    """
    Parse building numbers from a string.

    MODIFIED to handle empty number strings (for standalone streets).
    """
    buildings = []
    numbers_str = numbers_str.strip()

    # --- MODIFICATION ---
    # Handle empty number string, which now means a standalone street/village
    if numbers_str == "":
        buildings.append((street, "B/N"))  # B/N = Building Without Number
        return buildings
    # --- END MODIFICATION ---

    if numbers_str in ['.', ',', '-', '--']:
        return buildings

    if numbers_str in ['B/N', 'OSP', 'DZ6', 'PLE'] or re.match(r'^K/[A-Z]+$', numbers_str):
        buildings.append((street, numbers_str))
        return buildings

    if re.match(r'^[Dd]z\.?\s*', numbers_str):
        numbers_str = re.sub(r'^[Dd]z\.?\s*', '', numbers_str)

    if re.match(r'^nr[\s\-]', numbers_str):
        numbers_str = re.sub(r'^nr[\s\-]', '', numbers_str)

    numbers_str = re.sub(r'^\.?-+', '', numbers_str).strip()

    leading_zero_match = re.match(r'^\d{3,}-(.+)', numbers_str)
    if leading_zero_match:
        numbers_str = leading_zero_match.group(1)

    if '-' in numbers_str and not numbers_str.startswith('-'):
        dash_split = numbers_str.split('-', 1)
        if len(dash_split) == 2:
            potential_street = dash_split[0].strip()
            potential_number = dash_split[1].strip()
            if potential_street and potential_street[0].isupper() and potential_number and potential_number[
                0].isdigit():
                street = potential_street
                numbers_str = potential_number

    range_match = re.match(r'od\s+(\d+)\s+do\s+(\d+)', numbers_str, re.IGNORECASE)
    if range_match:
        start = int(range_match.group(1))
        end = int(range_match.group(2))
        for num in range(start, end + 1):
            buildings.append((street, str(num)))
        return buildings

    annotation_match = re.match(r'^([^\(]+)', numbers_str)
    if annotation_match:
        numbers_str = annotation_match.group(1).strip()

    single_match = re.match(r'^(\d+)([A-Za-z/\d\s]*)$', numbers_str)
    if single_match:
        base_number = single_match.group(1)
        suffix = single_match.group(2).strip()

        building_number = base_number
        if suffix:
            building_number = base_number + (' ' if ' ' in numbers_str else '') + suffix

        buildings.append((street, building_number))
        return buildings

    # Handle pure letter identifiers or mixed formats
    # Use a regex that includes Polish characters
    if re.match(r'^[A-Za-ząćęłńóśźżĆŁŃÓŚŹŻ][A-Za-ząćęłńóśźżĆŁŃÓŚŹŻ\d/]*$', numbers_str):
        buildings.append((street, numbers_str))
        return buildings

    if not buildings:
        # Fallback: if it's not a number but something else, treat it as the location
        # This helps catch things the regexes missed.
        buildings.append((street, numbers_str))

    return buildings


# --- Main Transformation Function ---

def transform_shutdown_data(shutdown_list):
    """
    Transforms the raw shutdown list into a nested dictionary structured by
    voivodeship (deptName) and city (regionName).

    Uses the modified parsing functions to correctly extract buildings.
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

    for shutdown in shutdown_list:
        try:
            voivodeship = oddzial_voievodship_map[shutdown.get('deptName')]
            city = shutdown.get('regionName')  # This is the "city" level from the request
            message = shutdown.get('message')
            hours_list = shutdown.get('hours', [])

            if not all([voivodeship, city, message, hours_list]):
                logger.warning(f"Skipping entry guid {shutdown.get('guid')}: missing essential data.")
                continue

            first_hour_slot = hours_list[0]
            from_date = first_hour_slot.get('fromDate')
            to_date = first_hour_slot.get('toDate')

            if not from_date or not to_date:
                logger.warning(f"Skipping entry guid {shutdown.get('guid')}: missing time data.")
                continue

            interval_str = f"{from_date} - {to_date}"

            # --- Use the new parsing logic ---
            (parsed_city, building_tuples) = parse_energa_locations(message)

            buildings_list = []

            # Check if the message was a "ulica/ulice" type
            is_street_format = bool(re.match(r'^(.*?)\s+ulic[ae]\s+', message))

            if not is_street_format:
                # Format is "Pąchów, Święciec." or "Łagiewniki."
                # The parsed_city is the first location.
                if parsed_city:
                    buildings_list.append(parsed_city)

            # Add all other parsed locations
            for street, num in building_tuples:
                # If format was "Słupsk ulica Inwestycyjna", street="Inwestycyjna", num="B/N"
                # If format was "Pąchów, Święciec", street="Święciec", num="B/N"
                # We want to format them cleanly

                location_name = street

                # If the "street" is the same as the "parsed_city", it's a number
                # for that city, e.g., ("Słupsk", [("Słupsk", "123")])
                if street == parsed_city and is_street_format:
                    location_name = num
                elif num != "B/N":
                    location_name = f"{street} {num}"

                # Avoid adding the "city" again if it's already in the list
                if location_name not in buildings_list:
                    buildings_list.append(location_name)

            # Final cleanup for any "B/N" strings
            buildings_list = [b.replace("B/N", "").strip() for b in buildings_list]
            # Remove potential duplicates
            buildings_list = list(dict.fromkeys(buildings_list))

            shutdown_details = {
                "interval": interval_str,
                "buildings": buildings_list,
            }
            # --- End new parsing logic ---

            if voivodeship not in transformed_data:
                transformed_data[voivodeship] = {}

            if city not in transformed_data[voivodeship]:
                transformed_data[voivodeship][city] = []

            transformed_data[voivodeship][city].append(shutdown_details)

        except Exception as e:
            logger.exception(f"Error processing shutdown guid {shutdown.get('guid')}: {e}")

    return transformed_data


def get_energa_planned_shutdowns() -> dict[str, dict[str, dict[str, tuple[datetime, datetime]]]]:
    """
    voivodeship:
        - city:
            - interval
                - buildings: {}

    """

    url = "https://energa-operator.pl/__system/api/document/EXTERNAL_DOCUMENT-305647/1761313426"

    try:
        shutdown_list = requests.get(url).json()['document']['payload']['shutdowns']

        res = transform_shutdown_data(shutdown_list)
        return res

    except Exception as e:
        logger.exception(f'Error trying scraping shutdowns from Energa: {e}')
        return {}


if __name__ == '__main__':
    res = get_energa_planned_shutdowns()

    json.dump(res, sys.stdout, ensure_ascii=False, indent=4)
