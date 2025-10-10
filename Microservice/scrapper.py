import re

from logging_config import setup_loguru

setup_loguru()

from loguru import logger
from bs4 import BeautifulSoup
import requests
from playwright.sync_api import sync_playwright
from datetime import datetime


def parse_building_numbers(street: str, numbers_text: str) -> list[tuple[str, str]]:
    """
    Parse building numbers from text like "od 1 do 5", "7", "9", "11/A", "dz. 168"
    """
    results = []

    # Handle "od X do Y" ranges
    range_pattern = r'od\s+(\d+)\s+do\s+(\d+)'

    # Find and process all ranges first
    for match in re.finditer(range_pattern, numbers_text):
        start = int(match.group(1))
        end = int(match.group(2))
        for num in range(start, end + 1):
            results.append((street, str(num)))
        # Remove the processed range from text
        numbers_text = numbers_text.replace(match.group(0), '', 1)

    # Now process individual numbers/codes
    # Match: standalone numbers, numbers with suffixes (11/A, 254/2), or "dz. X" or "DZ. X"
    individual_pattern = r'\b((?:dz\.|DZ\.)\s*\d+(?:/\d+)?|\d+(?:/[A-Z0-9]+)?)\b'

    for match in re.finditer(individual_pattern, numbers_text):
        number = match.group(1).strip()
        results.append((street, number))

    return results


def parse_energa_locations(locations: str) -> tuple[str, list[tuple[str, str]]]:
    """
    Parse the energa locations string into:
    (city: str, buildings: list[tuple[street: str, building_number: str]])

    Example:
        Input: "Trąbki Wielkie ulice Akacjowa od 1 do 5, 7, 9, Bukowa 1, 3..."
        Output: ("Trąbki Wielkie", [("Akacjowa", "1"), ("Akacjowa", "2"), ...])
    """
    # Extract city name (everything before "ulice" or "ulica")
    city_match = re.match(r'^(.*?)\s+ulic[ae]\s+', locations)
    if not city_match:
        return ("", [])

    city = city_match.group(1).strip()

    # Get the rest after "ulice/ulica"
    streets_text = locations[city_match.end():].strip()

    buildings = []
    current_street = None

    # Split by commas and process each part
    parts = [p.strip() for p in streets_text.split(',')]

    for part in parts:
        part = part.rstrip('.')

        # Check if this part starts a new street (capitalized word)
        # Street names are capitalized and followed by numbers or "od"
        street_match = re.match(r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż\s]+?)\s+(.+)$', part)

        if street_match:
            # New street found
            current_street = street_match.group(1).strip()
            numbers_part = street_match.group(2).strip()

            # Parse the numbers part
            buildings.extend(parse_building_numbers(current_street, numbers_part))
        else:
            # Continuation of previous street (just numbers)
            if current_street:
                buildings.extend(parse_building_numbers(current_street, part))

    return (city, buildings)


def parse_energa_datetime_interval(interval: str) -> list[tuple[datetime, datetime]]:
    """
        Parse Energa interval string into list of datetime tuples.

        :param interval: String in format "DD.MM.YYYY HH:MM–HH:MMHH:MM–HH:MM..."
        :return: List of tuples containing (start_datetime, end_datetime)

        Example:
            parse_energa_interval("21.10.2025 07:30–09:0015:00–16:30")
            [(datetime(2025, 10, 21, 7, 30), datetime(2025, 10, 21, 9, 0)),
             (datetime(2025, 10, 21, 15, 0), datetime(2025, 10, 21, 16, 30))]
        """
    try:
        # Split date and time parts
        parts = interval.split(' ', 1)
        date_str = parts[0]
        time_str = parts[1] if len(parts) > 1 else ""

        # Parse date
        day, month, year = map(int, date_str.split('.'))

        # Split time ranges by the en dash (–)
        time_parts = time_str.split('–')

        result = []
        i = 0

        while i < len(time_parts) - 1:
            start_time = time_parts[i]
            end_time = time_parts[i + 1]

            # If end_time is longer than 5 chars, it contains the next start time
            if len(end_time) > 5:
                # Split it: first 5 chars are end, rest is next start
                actual_end = end_time[:5]
                next_start = end_time[5:]

                # Parse current interval
                start_hour, start_min = map(int, start_time.split(':'))
                end_hour, end_min = map(int, actual_end.split(':'))

                start_dt = datetime(year, month, day, start_hour, start_min)
                end_dt = datetime(year, month, day, end_hour, end_min)
                result.append((start_dt, end_dt))

                # Insert the extracted start time for next iteration
                time_parts[i + 1] = next_start
                i += 1
            else:
                # Normal case
                start_hour, start_min = map(int, start_time.split(':'))
                end_hour, end_min = map(int, end_time.split(':'))

                start_dt = datetime(year, month, day, start_hour, start_min)
                end_dt = datetime(year, month, day, end_hour, end_min)
                result.append((start_dt, end_dt))

                i += 2

        return result

    except:
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

    oddziale = {}

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
            oddzial_name = oddzial.find_next('button').text.strip()
            print(oddzial_name)

            region_containers = oddzial.find_all('div', class_='breakdown__region')

            for region in region_containers:
                region_name = region.find_next('h3', class_='breakdown__region-name').text.strip()
                print("\t" + region_name)

                area_divs = region.find_all('div', class_='breakdown__area')

                for area_div in area_divs:
                    gmina_name = area_div.find('h4', class_='breakdown__area-name').text.strip()
                    print("\t\t" + gmina_name)
                    locations = area_div.find('div', class_='breakdown__area-message').text.strip()
                    print("\t\t\t", parse_energa_locations(locations))

                    interval = area_div.find('div', class_='breakdown__area-date').text.strip()
                    print("\t\t\t", parse_energa_datetime_interval(interval))

        # print(soup)

    except Exception as e:
        logger.exception(f'Error trying scraping shutdowns from Energa: {e}')

    return oddziale


if __name__ == '__main__':
    get_energa_planned_shutdowns()
