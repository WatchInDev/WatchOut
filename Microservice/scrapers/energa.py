import json
import re
import sys

from logging_config import setup_loguru

import requests
from datetime import datetime
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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
        loc = re.sub(r'(-[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]+)', '', loc, count = 1)
        # Remove text subdivisions like , Markubowo
        loc = re.sub(r'(,[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ ]+)', '', loc, count = 1)
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
                print(f"Skipping entry guid {shutdown.get('guid')}: missing essential data.")
                continue

            first_hour_slot = hours_list[0]
            from_date = first_hour_slot.get('fromDate')
            to_date = first_hour_slot.get('toDate')

            if not from_date or not to_date:
                print(f"Skipping entry guid {shutdown.get('guid')}: missing time data.")
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
            print(f"Error processing shutdown guid {shutdown.get('guid')}: {e}")

    # print(messages)

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
        # print(f'Error trying scraping shutdowns from Energa: {e}')
        raise e



if __name__ == '__main__':
    res = get_energa_planned_shutdowns()

    json.dump(res, sys.stdout, ensure_ascii=False, indent=4)
