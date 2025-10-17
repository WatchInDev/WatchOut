import json
import re
import sys

from ..logging_config import setup_loguru

setup_loguru()

from loguru import logger
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from datetime import datetime


def parse_energa_locations(locations: str) -> tuple[str, list[tuple[str, str]]]:
    """
    Parse the energa locations string into:
    (city: str, buildings: list[tuple[street: str, building_number: str]])

    Example:
        Input: "Trąbki Wielkie ulice Akacjowa od 1 do 5, 7, 9, Bukowa 1, 3..."
        Output: ("Trąbki Wielkie", [("Akacjowa", "1"), ("Akacjowa", "2"), ...])
    """
    try:
        # Extract city name (everything before "ulice" or "ulica")
        city_match = re.match(r'^(.*?)\s+ulic[ae]\s+', locations)

        if city_match:
            city = city_match.group(1).strip()
            streets_text = locations[city_match.end():].strip()
        else:
            # No "ulice/ulica" - try to extract city from first capitalized word(s)
            # Pattern: City name (with possible hyphens) followed by building numbers, "od", comma, dash, or special markers
            # Handles compound city names like "Mogielnica-Kolonia", "Nowa Kiszewa-Chrósty", "Łasin-Wybudowanie"
            city_match = re.match(
                r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[\s\-][A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*)\s+(?=\d|od\s|,|B/N|\.)',
                locations)
            if city_match:
                city = city_match.group(1).strip()
                streets_text = locations[city_match.end():].strip()
            else:
                logger.error(f'Failed to parse locations: {locations}')
                return ("", [])

        buildings = []
        current_street = city  # Default to city if no street specified

        # Split by commas and process each part
        parts = [p.strip() for p in streets_text.split(',')]

        i = 0
        while i < len(parts):
            part = parts[i].rstrip('.').strip()

            # Skip empty parts or just punctuation
            if not part or part in ['-', '.', '--']:
                i += 1
                continue

            # Check if this is a range "od X do Y" that might be split across commas
            if part.startswith('od ') and 'do' not in part:
                # Look ahead to find the "do Y" part
                range_start = part
                j = i + 1
                while j < len(parts) and 'do' not in parts[j]:
                    range_start += ', ' + parts[j].strip()
                    j += 1
                if j < len(parts):
                    range_start += ', ' + parts[j].strip()
                    # Now we have the complete range
                    buildings.extend(parse_building_numbers(current_street, range_start))
                    i = j + 1
                    continue

            # Check if this part starts a new street/village (capitalized word not followed by slash/number immediately)
            # Handles names with hyphens like "Nowa Kiszewa-Chrósty"
            street_match = re.match(r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[\s\-][A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*)\s+(.+)$',
                                    part)

            if street_match:
                potential_street = street_match.group(1).strip()
                numbers_part = street_match.group(2).strip()

                # Verify this is actually a street/village name, not a building number like "2A"
                # Street names should be at least 2 characters and not end with a digit
                if len(potential_street) >= 2 and not re.search(r'\d$', potential_street):
                    # New street/village found
                    current_street = potential_street
                    buildings.extend(parse_building_numbers(current_street, numbers_part))
                else:
                    # This is probably a continuation of numbers
                    buildings.extend(parse_building_numbers(current_street, part))
            else:
                # Continuation of previous street (just numbers) or special tokens
                buildings.extend(parse_building_numbers(current_street, part))

            i += 1

        return (city, buildings)

    except Exception as e:
        logger.exception(f'Failed to parse locations: {locations}')
        return ("", [])


def parse_building_numbers(street: str, numbers_str: str) -> list[tuple[str, str]]:
    """
    Parse building numbers from a string.
    Handles patterns like:
    - "1" -> [("street", "1")]
    - "od 1 do 5" -> [("street", "1"), ("street", "2"), ...]
    - "7/A" -> [("street", "7/A")]
    - "B/N" -> [("street", "B/N")] (building without number)
    - "OSP" -> [("street", "OSP")] (fire station)
    - "Dz. 120/36" -> [("street", "120/36")]
    - ".-52/7" or "--52/29" -> [("street", "52/7")]
    - "dz. nr-114/11" -> [("street", "114/11")]
    - "Street-624/3" -> [("Street", "624/3")]
    - "143/4 P26" -> [("street", "143/4 P26")]
    - "0010-40/10 (GPO) (MDZ)" -> [("street", "40/10")]
    - "K/POCZTY" -> [("street", "K/POCZTY")] (post office)
    """
    buildings = []

    # Handle special prefixes like "Dz.", "dz. nr-", ".-", "--", or street name prefix
    numbers_str = numbers_str.strip()

    # Skip pure punctuation
    if not numbers_str or numbers_str in ['.', ',', '-', '--']:
        return buildings

    # Handle special non-numeric identifiers
    if numbers_str in ['B/N', 'OSP', 'DZ6', 'PLE'] or re.match(r'^K/[A-Z]+$', numbers_str):
        buildings.append((street, numbers_str))
        return buildings

    # Remove "Dz." or "dz." prefix if present
    if re.match(r'^[Dd]z\.?\s*', numbers_str):
        numbers_str = re.sub(r'^[Dd]z\.?\s*', '', numbers_str)

    # Remove "nr-" or "nr " prefix if present
    if re.match(r'^nr[\s\-]', numbers_str):
        numbers_str = re.sub(r'^nr[\s\-]', '', numbers_str)

    # Handle ".-" or "--" or "---" prefix (just remove it)
    numbers_str = re.sub(r'^\.?-+', '', numbers_str).strip()

    # Handle leading zeros format like "0010-40/10"
    leading_zero_match = re.match(r'^\d{3,}-(.+)', numbers_str)
    if leading_zero_match:
        numbers_str = leading_zero_match.group(1)

    # Handle "Street-number" format (extract the number part)
    # But only if it's not part of the city name (which would already be in 'street' variable)
    if '-' in numbers_str and not numbers_str.startswith('-'):
        dash_split = numbers_str.split('-', 1)
        if len(dash_split) == 2:
            potential_street = dash_split[0].strip()
            potential_number = dash_split[1].strip()
            # If left side is capitalized and right side starts with digit, it's Street-Number format
            if potential_street and potential_street[0].isupper() and potential_number and potential_number[
                0].isdigit():
                street = potential_street
                numbers_str = potential_number

    # Check for range pattern "od X do Y"
    range_match = re.match(r'od\s+(\d+)\s+do\s+(\d+)', numbers_str)
    if range_match:
        start = int(range_match.group(1))
        end = int(range_match.group(2))
        for num in range(start, end + 1):
            buildings.append((street, str(num)))
        return buildings

    # Handle numbers with annotations in parentheses: "18/3 (MDZ)" or "40/10 (GPO) (MDZ)"
    # Extract the number part before parentheses
    annotation_match = re.match(r'^([^\(]+)', numbers_str)
    if annotation_match:
        numbers_str = annotation_match.group(1).strip()

    # Single number with optional suffix (7, 7/A, 7A, 7/1, 4 B, 143/4 P26, etc.)
    # This pattern matches numbers with various suffixes including spaces
    single_match = re.match(r'^(\d+)([A-Za-z/\d\s]*)$', numbers_str)
    if single_match:
        base_number = single_match.group(1)
        suffix = single_match.group(2).strip()

        building_number = base_number
        if suffix:
            # Handle space-separated suffixes like "4 B" or "6 B"
            building_number = base_number + (' ' if ' ' in numbers_str else '') + suffix

        buildings.append((street, building_number))
        return buildings

    # Handle pure letter identifiers or mixed formats like "K/POCZTY"
    if re.match(r'^[A-Z][A-Z\d/]*$', numbers_str):
        buildings.append((street, numbers_str))
        return buildings

    # If nothing matched, try to extract any numbers
    number_pattern = re.findall(r'\d+[A-Za-z/\d]*', numbers_str)
    if number_pattern:
        for num in number_pattern:
            buildings.append((street, num))

    return buildings


def parse_energa_datetime_interval(interval: str) -> list[tuple[datetime, datetime]]:
    """
    Parse Energa interval string into list of datetime tuples.
    Handles multiple dates and time ranges.

    :param interval: String like "DD.MM.YYYY HH:MM–HH:MM..." or with multiple dates
    :return: List of tuples containing (start_datetime, end_datetime)

    Example:
        parse_energa_interval("21.10.2025 07:30–09:0015:00–16:30")
        [(datetime(2025, 10, 21, 7, 30), datetime(2025, 10, 21, 9, 0)),
         (datetime(2025, 10, 21, 15, 0), datetime(2025, 10, 21, 16, 30))]
    """
    try:
        import re

        result = []
        current_date = None

        # Split by date pattern (DD.MM.YYYY) to find date boundaries
        # This regex captures dates and keeps them in the result
        parts = re.split(r'(\d{2}\.\d{2}\.\d{4})', interval)

        i = 0
        while i < len(parts):
            part = parts[i].strip()

            # Check if this part is a date
            if re.match(r'^\d{2}\.\d{2}\.\d{4}$', part):
                # Parse the new date
                day, month, year = map(int, part.split('.'))
                current_date = (year, month, day)
                i += 1
                continue

            # Process time ranges for current date
            if part and current_date:
                # Split time ranges by en dash
                time_parts = re.split(r'–', part)

                j = 0
                while j < len(time_parts) - 1:
                    start_time = time_parts[j].strip()
                    end_time = time_parts[j + 1].strip()

                    # Handle concatenated times (e.g., "09:0015:00")
                    if len(end_time) > 5:
                        actual_end = end_time[:5]
                        next_start = end_time[5:]

                        # Parse current interval
                        start_hour, start_min = map(int, start_time.split(':'))
                        end_hour, end_min = map(int, actual_end.split(':'))

                        start_dt = datetime(*current_date, start_hour, start_min)
                        end_dt = datetime(*current_date, end_hour, end_min)
                        result.append((start_dt, end_dt))

                        # Replace for next iteration
                        time_parts[j + 1] = next_start
                        j += 1
                    else:
                        # Normal case
                        start_hour, start_min = map(int, start_time.split(':'))
                        end_hour, end_min = map(int, end_time.split(':'))

                        start_dt = datetime(*current_date, start_hour, start_min)
                        end_dt = datetime(*current_date, end_hour, end_min)
                        result.append((start_dt, end_dt))
                        j += 2

            i += 1

        return result

    except Exception as e:
        logger.exception(f"Failed to parse interval '{interval}'")
        return []


def get_energa_planned_shutdowns() -> dict[str, dict[str, dict[str, tuple[datetime, datetime]]]]:
    """
        oddzial:
            - region:
                - gmina:
                    - ulica i nr. domu : (start_date, end_date)
                    - ulica i nr. domu : (start_date, end_date)
    """
    url = "https://energa-operator.pl/uslugi/awarie-i-wylaczenia/wylaczenia-planowane"

    voievodships = {}

    oddzial_voievodship_map = {
        "Gdańsk": "Pomorskie",
        "Kalisz": "Wielkopolskie",
        "Koszalin": "Zachodniopomorskie",
        "Olsztyn": "Warmińsko-mazurskie",
        "Płock": "Mazowieckie",
        "Toruń": "Kujawsko-pomorskie",
    }

    try:
        # Session-based approach because the website uses CSR with hydration :0
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url)

            accordion_css_selector = 'div.accordion-item'
            # Wait for content to load
            page.wait_for_selector(accordion_css_selector)

            html = page.content()
            browser.close()

        soup = BeautifulSoup(html, 'lxml')

        oddziale_selectors = soup.select(accordion_css_selector)

        for i, oddzial in enumerate(oddziale_selectors):
            oddzial_name = oddzial.find_next('button').text.replace("Oddział", "").strip()
            voievodship = oddzial_voievodship_map[oddzial_name]

            print(voievodship)

            region_containers = oddzial.find_all('div', class_='breakdown__region')
            cities_and_buildings_and_intervals = {}
            for region in region_containers:
                region_name = region.find_next('h3', class_='breakdown__region-name').text.strip()
                print("\t" + region_name)

                area_divs = region.find_all('div', class_='breakdown__area')

                """
                {
                    "city": 
                    {
                        "buildings": [(street), (number)],
                        "intervals": [datetime(), datetime()]    
                    }
                }
                """
                for area_div in area_divs:
                    gmina_name = area_div.find('h4', class_='breakdown__area-name').text.strip()
                    print("\t\t" + gmina_name)
                    locations = area_div.find_all('div', class_='breakdown__area-message')

                    parsed_locations = []

                    for location in locations:
                        parsed_locations.append(parse_energa_locations(location.text.strip()))

                    parsed_intervals = []

                    intervals = area_div.find_all('div', class_='breakdown__area-date')
                    for interval in intervals:
                        parsed_intervals.append(parse_energa_datetime_interval(interval.text.strip()))

                    for location, interval in zip(parsed_locations, parsed_intervals):
                        print("\t\t\t", location, interval)
                        city, buildings = location

                        # Convert list of tuples to list of strings "street number"
                        buildings_list = [f"{street} {number}" for street, number in buildings]

                        intervals_list = [
                            {
                                "start": start.isoformat(),
                                "end": end.isoformat()
                            }
                            for start, end in interval
                        ]

                        cities_and_buildings_and_intervals[city] = {
                            'buildings': buildings_list,
                            'intervals': intervals_list
                        }

            voievodships[voievodship] = cities_and_buildings_and_intervals

    except Exception as e:
        logger.exception(f'Error trying scraping shutdowns from Energa: {e}')

    return voievodships


if __name__ == '__main__':
    res = get_energa_planned_shutdowns()

    json.dump(res, sys.stdout, ensure_ascii=False, indent=4)
