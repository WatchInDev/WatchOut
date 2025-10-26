import json
import re
import sys

from Microservice.logging_config import setup_loguru

setup_loguru()

from loguru import logger
import requests
from datetime import datetime
import re


# def parse_energa_locations(locations: str) -> tuple[str, list[tuple[str, str]]]:
#     """
#     Parse the energa locations string into:
#     (city: str, buildings: list[tuple[street: str, building_number: str]])
#
#     MODIFIED to correctly handle standalone streets/villages.
#     """
#     try:
#         # Extract city name (everything before "ulice" or "ulica")
#         city_match = re.match(r'^(.*?)\s+ulic[ae]\s+', locations)
#
#         if city_match:
#             city = city_match.group(1).strip()
#             streets_text = locations[city_match.end():].strip()
#         else:
#             # No "ulice/ulica" - try to extract city from first capitalized word(s)
#             city_match = re.match(
#                 r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[\s\-][A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*)\s*(?=\d|od\s|,|B/N|\.|$)',
#                 locations)
#             if city_match:
#                 city = city_match.group(1).strip()
#                 streets_text = locations[city_match.end():].strip().lstrip(',').strip()
#             else:
#                 logger.warning(f'Failed to parse city from locations: {locations}')
#                 return (locations, [])  # Return original string as "city" if all else fails
#
#         buildings = []
#         current_street = city  # Default to city if no street specified
#
#         # Split by commas and process each part
#         parts = [p.strip() for p in streets_text.split(',')]
#
#         i = 0
#         while i < len(parts):
#             part = parts[i].rstrip('.').strip()
#
#             if not part or part in ['-', '.', '--']:
#                 i += 1
#                 continue
#
#             if part.startswith('od ') and 'do' not in part:
#                 range_start = part
#                 j = i + 1
#                 while j < len(parts) and 'do' not in parts[j]:
#                     range_start += ', ' + parts[j].strip()
#                     j += 1
#                 if j < len(parts):
#                     range_start += ', ' + parts[j].strip()
#                     buildings.extend(parse_building_numbers(current_street, range_start))
#                     i = j + 1
#                     continue
#
#             # --- MODIFICATION ---
#             # Original regex required numbers: r'^([A-Z...]*)\s+(.+)$'
#             # New regex makes numbers optional: r'^([A-Z...]*)(?:\s+(.+))?$'
#             street_match = re.match(
#                 r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[\s\-][A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*)(?:\s+(.+))?$',
#                 part)
#
#             if street_match:
#                 potential_street = street_match.group(1).strip()
#                 # group(2) can be None if no numbers are present
#                 numbers_part = street_match.group(2).strip() if street_match.group(2) else ""
#
#                 if len(potential_street) >= 2 and not re.search(r'\d$', potential_street):
#                     current_street = potential_street
#                     buildings.extend(parse_building_numbers(current_street, numbers_part))
#                 else:
#                     buildings.extend(parse_building_numbers(current_street, part))
#             else:
#                 buildings.extend(parse_building_numbers(current_street, part))
#
#             i += 1
#
#         return (city, buildings)
#
#     except Exception as e:
#         logger.exception(f'Failed to parse locations: {locations}')
#         return ("", [])
#
#
# # --- User-provided function with modifications ---
#
# def parse_building_numbers(street: str, numbers_str: str) -> list[tuple[str, str]]:
#     """
#     Parse building numbers from a string.
#
#     MODIFIED to handle empty number strings (for standalone streets).
#     """
#     buildings = []
#     numbers_str = numbers_str.strip()
#
#     # --- MODIFICATION ---
#     # Handle empty number string, which now means a standalone street/village
#     if numbers_str == "":
#         buildings.append((street, "B/N"))  # B/N = Building Without Number
#         return buildings
#     # --- END MODIFICATION ---
#
#     if numbers_str in ['.', ',', '-', '--']:
#         return buildings
#
#     if numbers_str in ['B/N', 'OSP', 'DZ6', 'PLE'] or re.match(r'^K/[A-Z]+$', numbers_str):
#         buildings.append((street, numbers_str))
#         return buildings
#
#     if re.match(r'^[Dd]z\.?\s*', numbers_str):
#         numbers_str = re.sub(r'^[Dd]z\.?\s*', '', numbers_str)
#
#     if re.match(r'^nr[\s\-]', numbers_str):
#         numbers_str = re.sub(r'^nr[\s\-]', '', numbers_str)
#
#     numbers_str = re.sub(r'^\.?-+', '', numbers_str).strip()
#
#     leading_zero_match = re.match(r'^\d{3,}-(.+)', numbers_str)
#     if leading_zero_match:
#         numbers_str = leading_zero_match.group(1)
#
#     if '-' in numbers_str and not numbers_str.startswith('-'):
#         dash_split = numbers_str.split('-', 1)
#         if len(dash_split) == 2:
#             potential_street = dash_split[0].strip()
#             potential_number = dash_split[1].strip()
#             if potential_street and potential_street[0].isupper() and potential_number and potential_number[
#                 0].isdigit():
#                 street = potential_street
#                 numbers_str = potential_number
#
#     range_match = re.match(r'od\s+(\d+)\s+do\s+(\d+)', numbers_str, re.IGNORECASE)
#     if range_match:
#         start = int(range_match.group(1))
#         end = int(range_match.group(2))
#         for num in range(start, end + 1):
#             buildings.append((street, str(num)))
#         return buildings
#
#     annotation_match = re.match(r'^([^\(]+)', numbers_str)
#     if annotation_match:
#         numbers_str = annotation_match.group(1).strip()
#
#     single_match = re.match(r'^(\d+)([A-Za-z/\d\s]*)$', numbers_str)
#     if single_match:
#         base_number = single_match.group(1)
#         suffix = single_match.group(2).strip()
#
#         building_number = base_number
#         if suffix:
#             building_number = base_number + (' ' if ' ' in numbers_str else '') + suffix
#
#         buildings.append((street, building_number))
#         return buildings
#
#     # Handle pure letter identifiers or mixed formats
#     # Use a regex that includes Polish characters
#     if re.match(r'^[A-Za-ząćęłńóśźżĆŁŃÓŚŹŻ][A-Za-ząćęłńóśźżĆŁŃÓŚŹŻ\d/]*$', numbers_str):
#         buildings.append((street, numbers_str))
#         return buildings
#
#     if not buildings:
#         # Fallback: if it's not a number but something else, treat it as the location
#         # This helps catch things the regexes missed.
#         buildings.append((street, numbers_str))
#
#     return buildings


# --- Main Transformation Function ---

def parse_locations(line: str) -> list[str]:
    """
    Parses a single line of location text into a list of building identifiers,
    omitting the base city name if 'ulica' or 'ulice' is specified.

    Rules:
    1. Expands "od n do m" ranges (e.g., "od 13 do 15" -> "13, 14, 15").
    2. If "ulica" or "ulice" is present, the base city name is *omitted*
       from the output.
       - "Gdynia ulica Hutnicza 40" -> ["Hutnicza 40"]
       - "Elbląg ulica Jelenia Dolina" -> ["Jelenia Dolina"]
    3. If "ulica" or "ulice" is NOT present, the locality name is *included*
       in the output.
       - "Krzyżewo" -> ["Krzyżewo"]
       - "Rogity 53, 53 A, 55" -> ["Rogity 53", "Rogity 53 A", "Rogity 55"]
    4. Removes city part subdivisions (e.g., "-Wybudowanie", ", Markubowo")
       from locality names.
       - "Kościerzyna, Markubowo" -> ["Kościerzyna"]
    5. Handles single item entries for whole streets or localities.
    """

    # --- Pre-processing ---
    line = line.strip().strip('.')
    # Ignore log lines or empty lines
    if line.startswith('2025-') or not line:
        return []

    # Rule 1: Unwrap "od n do m" ranges
    def expand_range(match: re.Match) -> str:
        """Helper to expand 'od n do m' to 'n, n+1, ..., m'"""
        try:
            start = int(match.group(1))
            end = int(match.group(2))
            if start > end:
                start, end = end, start
            # Join with comma and space to ensure they are treated as separate items
            return ', '.join(str(i) for i in range(start, end + 1))
        except ValueError:
            return match.group(0)  # Return original if conversion fails

    line = re.sub(r'od (\d+) do (\d+)', expand_range, line, flags=re.IGNORECASE)
    # Clean metadata like (GPO), (MDZ), etc.
    line = re.sub(r'\(.*?\)', '', line).strip()

    # --- Helper Functions ---

    def clean_locality_name(loc: str) -> str:
        """
        Applies Rule 4: Removes city subdivisions.
        e.g., "Kościerzyna-Wybudowanie" -> "Kościerzyna"
        e.g., "Kościerzyna, Markubowo" -> "Kościerzyna"
        """
        # Remove text subdivisions like -Wybudowanie, -Kolonia
        loc = re.sub(r'(-[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]+)', '', loc, 1)
        # Remove text subdivisions like , Markubowo
        loc = re.sub(r'(,[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ ]+)', '', loc, 1)
        return loc.strip()

    def is_full_name(item: str) -> bool:
        """
        Checks if item is a "Full Name" or "Full Name 123".
        Returns False if it's just a number/suffix like "14", "53 A", "S5-74".
        """
        # Check for at least one letter
        if not re.search(r'[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]', item):
            return False  # "14", "15/12"

        # Check if it starts with a "word" (2+ letters)
        if re.match(r'[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]{2,}', item):
            # "Rogity 53", "Hutnicza 10", "Krzyżewo", "Osiedle Sambora I", "DZ. 80"
            return True

        # Check if it starts with a digit but contains a word (2+ letters)
        if re.match(r'\d', item) and re.search(r'[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]{2,}', item):
            return True  # "1 Maja"

        # Else, it's just a number/suffix
        # "53 A" (only 1 letter)
        # "S5-74" (starts with 1 letter)
        return False

    # --- Main Parsing Logic ---
    buildings: list[str] = []

    # Check for "ulica" or "ulice"
    # This regex splits "City_Name" from "ulice Street_Part"
    street_match = re.match(r'^(.*?)(?: +(ulica|ulice) +(.*))?$', line, re.IGNORECASE)

    if not street_match:
        return []  # Should not happen

    base_part = street_match.group(1).strip()
    street_specifier = street_match.group(2)  # "ulica" or "ulice"
    street_part = street_match.group(3).strip() if street_match.group(3) else None

    if street_specifier:
        # --- Case 1: "ulica" or "ulice" is present (Rule 2) ---
        # The base_part (city name) is DISCARDED.
        # We only parse the street_part.
        # e.g., "Gdynia ulice Bolesława Krzywoustego 1C, 4, Hutnicza 10..."
        # Output: ["Bolesława Krzywoustego 1C", "Bolesława Krzywoustego 4", "Hutnicza 10"]

        current_street = ""
        items = [s.strip() for s in street_part.split(',') if s.strip()]

        for item in items:
            if is_full_name(item):
                # Item is a full new street name, e.g., "Hutnicza 10" or "Jelenia Dolina" or "1 Maja"
                buildings.append(item)

                # Update current_street for subsequent numbers
                m_digit = re.search(r'\d', item)
                if not m_digit:
                    # No digits, e.g., "Jelenia Dolina"
                    current_street = item
                else:
                    # Has digits, e.g., "Hutnicza 10" or "1 Maja"
                    # Find last space
                    last_space_idx = item.rfind(' ')
                    if last_space_idx != -1:
                        number_part = item[last_space_idx + 1:]
                        # Check if end is a number (e.g. "10", "1C") or Roman (e.g. "I", "II")
                        if re.search(r'\d', number_part) or re.match(r'^[IVXLC]+$', number_part, re.IGNORECASE):
                            current_street = item[:last_space_idx].strip()  # "Hutnicza"
                        else:
                            current_street = item  # "1 Maja"
                    else:
                        current_street = item  # e.g. "Hutnicza10" (no space)
            else:
                # Item is just a number/suffix, e.g., "4" or "53 A"
                if current_street:
                    buildings.append(f"{current_street} {item}")

    else:
        # --- Case 2: "ulica" or "ulice" is NOT present (Rule 3) ---
        # The base_part (locality) is INCLUDED.
        # e.g., "Krzyżewo"
        # e.g., "Rogity 53, 53 A, 53 B..."
        # e.g., "Kościerzyna, Markubowo" (Rule 4 applies)

        current_locality = ""
        items = [s.strip() for s in base_part.split(',') if s.strip()]

        for item in items:
            if is_full_name(item):
                # Item is a full new locality name, e.g., "Rogity 53" or "Krzyżewo"

                # Apply Rule 4: Clean subdivisions
                cleaned_item = clean_locality_name(item)
                buildings.append(cleaned_item)

                # Update current_locality with the *cleaned* name base
                last_space_idx = cleaned_item.rfind(' ')
                if last_space_idx != -1:
                    number_part = cleaned_item[last_space_idx + 1:]
                    # Check if end is a number (e.g. "53")
                    if re.search(r'\d', number_part) or re.match(r'^[IVXLC]+$', number_part, re.IGNORECASE):
                        current_locality = cleaned_item[:last_space_idx].strip()  # "Rogity"
                    else:
                        current_locality = cleaned_item  # "Dolne Grądy"
                else:
                    current_locality = cleaned_item  # "Krzyżewo"
            else:
                # Item is just a number/suffix, e.g., "14" or "53 A"
                if current_locality:
                    buildings.append(f"{current_locality} {item}")

    # Final filter to remove empty strings
    return [b for b in buildings if b]

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

    messages = []

    for shutdown in shutdown_list:
        try:
            voivodeship = oddzial_voievodship_map[shutdown.get('deptName')]
            city = shutdown.get('regionName')  # This is the "city" level from the request
            message = shutdown.get('message')
            hours_list = shutdown.get('hours', [])

            # print(message, end='\n\n')

            messages.append(message)

            if not all([voivodeship, city, message, hours_list]):
                logger.warning(f"Skipping entry guid {shutdown.get('guid')}: missing essential data.")
                continue

            first_hour_slot = hours_list[0]
            from_date = first_hour_slot.get('fromDate')
            to_date = first_hour_slot.get('toDate')

            if not from_date or not to_date:
                logger.warning(f"Skipping entry guid {shutdown.get('guid')}: missing time data.")
                continue

            shutdown_details = {
                "interval": {
                    "from_date": from_date,
                    "to_date": to_date,
                },
                "locations": parse_locations(message),
            }

            if voivodeship not in transformed_data:
                transformed_data[voivodeship] = {}

            if city not in transformed_data[voivodeship]:
                transformed_data[voivodeship][city] = []

            transformed_data[voivodeship][city].append(shutdown_details)

        except Exception as e:
            logger.exception(f"Error processing shutdown guid {shutdown.get('guid')}: {e}")

    print(messages)

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
        logger.exception(f'Error trying scraping shutdowns from Energa: {e}')
        return {}


if __name__ == '__main__':
    res = get_energa_planned_shutdowns()

    json.dump(res, sys.stdout, ensure_ascii=False, indent=4)
