import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
import json
import time
from typing import Any

import requests
from loguru import logger

from Microservice.logging_config import setup_loguru

setup_loguru()

sample_url = """
https://www.tauron-dystrybucja.pl/waapi/outages/area
?provinceGAID=2&districtGAID=1041&fromDate=2025-10-17T15:21:32.682Z&toDate=2025-10-22T15:21:32.682Z&_=1760714469806
"""

voivodeship_powiats_map = {
    "Dolnośląskie": [
        "bolesławiecki",
        "dzierżoniowski",
        "głogowski",
        "górowski",
        "jaworski",
        "jeleniogórski",
        "kamiennogórski",
        "kłodzki",
        "legnicki",
        "lubański",
        "lubiński",
        "lwówecki",
        "milicki",
        "oleśnicki",
        "oławski",
        "polkowicki",
        "strzeliński",
        "średzki",
        "świdnicki",
        "trzebnicki",
        "wałbrzyski",
        "wołowski",
        "wrocławski",
        "ząbkowicki",
        "zgorzelecki",
        "złotoryjski",
        "jelenia góra",
        "legnica",
        "wałbrzych",
        "wrocław"
    ],
    "Lubuskie": [
        "gorzowski",
        "krośnieński",
        "międzyrzecki",
        "nowosolski",
        "słubicki",
        "strzelecko-drezdenecki",
        "suleciński",
        "świebodziński",
        "wschowski",
        "zielonogórski",
        "żagański",
        "żarski",
        "gorzów wielkopolski",
        "zielona góra"
    ],
    "Łódzkie": [
        "bełchatowski",
        "brzeziński",
        "kutnowski",
        "łaski",
        "łęczycki",
        "łowicki",
        "łódzki wschodni",
        "opoczyński",
        "pabianicki",
        "pajęczański",
        "piotrkowski",
        "poddębicki",
        "radomszczański",
        "rawski",
        "sieradzki",
        "skierniewicki",
        "tomaszowski",
        "wieluński",
        "wieruszowski",
        "zduńskowolski",
        "zgierski",
        "łódź",
        "piotrków trybunalski",
        "skierniewice"
    ],
    "Małopolskie": [
        "bocheński",
        "brzeski",
        "chrzanowski",
        "dąbrowski",
        "gorlicki",
        "krakowski",
        "limanowski",
        "miechowski",
        "myślenicki",
        "nowosądecki",
        "nowotarski",
        "olkuski",
        "oświęcimski",
        "proszowicki",
        "suski",
        "tarnowski",
        "tatrzański",
        "wadowicki",
        "wielicki",
        "kraków",
        "nowy sącz",
        "tarnów"
    ],
    "Opolskie": [
        "brzeski",
        "głubczycki",
        "kędzierzyńsko-kozielski",
        "kluczborski",
        "krapkowicki",
        "namysłowski",
        "nyski",
        "oleski",
        "opolski",
        "prudnicki",
        "strzelecki",
        "opole"
    ],
    "Podkarpackie": [
        "bieszczadzki",
        "brzozowski",
        "dębicki",
        "jarosławski",
        "jasielski",
        "kolbuszowski",
        "krośnieński",
        "leski",
        "leżajski",
        "lubaczowski",
        "łańcucki",
        "mielecki",
        "niżański",
        "przemyski",
        "przeworski",
        "ropczycko-sędziszowski",
        "rzeszowski",
        "sanocki",
        "stalowowolski",
        "strzyżowski",
        "tarnobrzeski",
        "krosno",
        "przemyśl",
        "rzeszów",
        "tarnobrzeg"
    ],
    "Śląskie": [
        "będziński",
        "bielski",
        "bieruńsko-lędziński",
        "cieszyński",
        "częstochowski",
        "gliwicki",
        "kłobucki",
        "lubliniecki",
        "mikołowski",
        "myszkowski",
        "pszczyński",
        "raciborski",
        "rybnicki",
        "tarnogórski",
        "wodzisławski",
        "zawierciański",
        "żywiecki",
        "bielsko-biała",
        "bytom",
        "chorzów",
        "częstochowa",
        "dąbrowa górnicza",
        "gliwice",
        "jastrzębie-zdrój",
        "jaworzno",
        "katowice",
        "mysłowice",
        "piekary śląskie",
        "ruda śląska",
        "rybnik",
        "siemianowice śląskie",
        "sosnowiec",
        "świętochłowice",
        "tychy",
        "zabrze",
        "żory"
    ],
    "Świętokrzyskie": [
        "buski",
        "jędrzejowski",
        "kazimierski",
        "kielecki",
        "konecki",
        "opatowski",
        "ostrowiecki",
        "pińczowski",
        "sandomierski",
        "skarżyski",
        "starachowicki",
        "staszowski",
        "włoszczowski",
        "kielce"
    ],
    "Wielkopolskie": [
        "chodzieski",
        "czarnkowsko-trzcianecki",
        "gnieźnieński",
        "gostyński",
        "grodziski",
        "jarociński",
        "kaliski",
        "kępiński",
        "kolski",
        "koniński",
        "kościański",
        "krotoszyński",
        "leszczyński",
        "międzychodzki",
        "nowotomyski",
        "obornicki",
        "ostrowski",
        "ostrzeszowski",
        "pilski",
        "pleszewski",
        "poznański",
        "rawicki",
        "słupecki",
        "szamotulski",
        "średzki",
        "śremski",
        "turecki",
        "wągrowiecki",
        "wolsztyński",
        "wrzesiński",
        "złotowski",
        "kalisz",
        "konin",
        "leszno",
        "poznań"
    ]
}


def infer_voivodeship_GAIDs():
    base_url = "https://www.tauron-dystrybucja.pl/waapi/enum/geo/provinces?partName={province_name}&_=1761054153270"

    voivodeship_GAID_map = {}

    for voivodeship in voivodeship_powiats_map.keys():
        response = requests.get(base_url.format(province_name=voivodeship))

        response = response.json()
        print(response)
        # Each request may result in a bunch of matches, so iterate over all of them not to miss anything
        for resp_chunk in response:
            voivodeship_GAID_map[resp_chunk['Name']] = resp_chunk['GAID']

    with open('source/tauron_voivodeship_map.json', 'w', encoding='utf-8') as file:
        json.dump(voivodeship_GAID_map, file, ensure_ascii=False, indent=4)


def infer_powiat_GAIDs():
    """
    Infers GAIDs for each powiat and writes a json file with all voievodhsips and their districts along with their GAIDs
    """
    base_url = "https://www.tauron-dystrybucja.pl/waapi/enum/geo/districts?partName={district_name}&ownerGAID={voievodhsip_GAID}&_=1761054153270"

    voivodeship_GAID_map = json.load(open('source/tauron_voivodeship_map.json', 'r', encoding='utf-8'))
    powiat_GAID_map = json.load(open('source/tauron_powiat_map.json', 'r', encoding='utf-8'))

    voivodeship_powiat_GAID_map = []

    for voivodeship, powiats in voivodeship_powiats_map.items():
        voivodeship_GAID = voivodeship_GAID_map[voivodeship]
        print(voivodeship_GAID)
        for powiat in powiats:
            if powiat.lower() not in powiat_GAID_map.keys():
                try:
                    url = base_url.format(district_name=powiat, voievodhsip_GAID=voivodeship_GAID)
                    response = requests.get(url)
                except Exception as e:
                    logger.exception(f"Exception making request to {url}:\n {e}")
                    continue

                response = response.json()
                print(response)

                # Each request may result in a bunch of matches, so iterate over all of them not to miss anything
                for resp_chunk in response:
                    powiat_GAID_map[resp_chunk['Name'].lower()] = resp_chunk['GAID']

        voivodeship_powiat_GAID_map.append({'voivodeship': {voivodeship: voivodeship_GAID},
                                            'districts': {name: GAID for name, GAID in powiat_GAID_map.items() if
                                                          name.lower() in powiats}})

    with open('source/tauron_powiat_map.json', 'w', encoding='utf-8') as file:
        json.dump(powiat_GAID_map, file, ensure_ascii=False, indent=4)

    with open('source/tauron_voivodeship_powiat_map.json', 'w', encoding='utf-8') as file:
        json.dump(voivodeship_powiat_GAID_map, file, ensure_ascii=False, indent=4)


def preprocess_tauron_message(message_str: str) -> str:
    """
    Cleans and reformats a Tauron message string to be compatible
    with the energa parsing functions.

    UPDATED to handle complex mid-string "ulica" and "dz."
    """
    if not message_str:
        return ""

    # 1. Remove trailing junk
    message = message_str.strip().rstrip('.,')
    message = re.sub(r'\s*-\s*chwilowe przerwy.*$', '', message, flags=re.IGNORECASE)
    message = re.sub(r'\s*pozbawione zasilania.*$', '', message, flags=re.IGNORECASE)
    # *** FIX for "i działki przyległe" ***
    message = re.sub(r'\s+i\s+działki\s+przyległe.*$', '', message, flags=re.IGNORECASE)

    # 2. Normalize "ulica" variants
    message = message.replace('ul.', 'ulica').replace('ulice:', 'ulice')

    # 3. Handle "City, ulica" pattern by removing the comma
    message = message.replace(', ulica', ' ulica').replace(', ulice', ' ulice')

    # 4. Handle "miejscowości" prefixes
    message = re.sub(r'^(miejscowości|Miejscowości)\s+', '', message, flags=re.IGNORECASE)

    # 5. Handle "numery"
    message = re.sub(r'\s+numery\s+', ' ', message, flags=re.IGNORECASE)

    # 6. Handle "...ulice Siewna, Rolna" in complex strings
    message = message.replace(', ulice ', ', ')

    # 7. *** NEW FIX for "1 Maja 41 ulica Wesoła" ***
    # Replace any "ulica" mid-string with a comma, to separate it
    message = re.sub(r'\s+(ulica|ulice)\s+', ', ', message, flags=re.IGNORECASE)

    # 8. Normalize "działka"
    message = re.sub(r'działka budowlana|dz\.', '', message, flags=re.IGNORECASE).strip()

    return message.strip().rstrip(',')


def parse_tauron_locations(locations: str) -> tuple[str, list[tuple[str, str]]]:
    """
    Parse the energa locations string into:
    (city: str, buildings: list[tuple[street: str, building_number: str]])

    UPDATED with a more robust street_match regex and "od..do" fix.
    """
    try:
        # Extract city name (everything before "ulice" or "ulica")
        city_match = re.match(r'^(.*?)\s+ulic[ae]\s+', locations, re.IGNORECASE)

        if city_match:
            city = city_match.group(1).strip().rstrip(',')
            streets_text = locations[city_match.end():].strip()
        else:
            # No "ulice/ulica" - try to extract city
            city_match = re.match(
                r'^([A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[\s\-][A-ZĆŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*)\s*(?=\d|od\s|,|B/N|\.|$)',
                locations)
            if city_match:
                city = city_match.group(1).strip().rstrip(',')
                streets_text = locations[city_match.end():].strip().lstrip(',').strip()
            else:
                logger.warning(f'Failed to parse city from locations: {locations}')
                return (locations, [])  # Return original as city if all fails

        buildings = []
        current_street = city

        parts = [p.strip() for p in streets_text.split(',')]

        i = 0
        while i < len(parts):
            part = parts[i].rstrip('.').strip()

            if not part or part in ['-', '.', '--']:
                i += 1
                continue

            # *** FIX for "od..do" ***
            # Explicitly check for "od...do" ranges first
            if part.lower().startswith('od ') and 'do' in part.lower():
                buildings.extend(parse_building_numbers(current_street, part))
                i += 1
                continue

            # ... (range 'od..do' split across commas) ...
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
                else:
                    # In case 'do' part is missing, parse what we have
                    buildings.extend(parse_building_numbers(current_street, range_start))
                    i = j
                    continue

            # *** NEW/IMPROVED street_match regex ***
            # Tries to match a "street name" part and a "numbers part"
            # Street name can include numbers (e.g., "3 Maja")
            # Numbers part must start with a number or "od"
            street_match = re.match(
                r'^((?:[A-ZĆŁŃÓŚŹŻ0-9][a-ząćęłńóśźż\s\.\-]*?))\s+((?:\d|od).+)$',
                part, re.IGNORECASE)

            if street_match:
                potential_street = street_match.group(1).strip().rstrip('.,')
                numbers_part = street_match.group(2).strip()
                current_street = potential_street
                buildings.extend(parse_building_numbers(current_street, numbers_part))
            # *** BUG FIX ***
            # Removed the `elif` that incorrectly identified building names
            # (like "Zakład metalowy VERTICAL") as new streets.
            else:  # Fallback for numbers-only OR standalone building name
                buildings.extend(parse_building_numbers(current_street, part))

            i += 1

        return (city, buildings)

    except Exception as e:
        logger.exception(f'Failed to parse locations: {locations}')
        return ("", [])


def parse_building_numbers(street: str, numbers_str: str) -> list[tuple[str, str]]:
    """
    Parse building numbers from a string.

    UPDATED with improved "oraz" and list logic.
    """
    buildings = []
    numbers_str = numbers_str.strip().rstrip('.,')

    if numbers_str == "":
        buildings.append((street, "B/N"))
        return buildings

    if numbers_str in ['.', ',', '-', '--']: return buildings
    if numbers_str in ['B/N', 'OSP', 'DZ6', 'PLE'] or re.match(r'^K/[A-Z]+$', numbers_str):
        buildings.append((street, numbers_str))
        return buildings
    if re.match(r'^[Dd]z\.?\s*', numbers_str):
        numbers_str = re.sub(r'^[Dd]z\.?\s*', '', numbers_str)
    if re.match(r'^nr[\s\-]', numbers_str):
        numbers_str = re.sub(r'^nr[\s\-]', '', numbers_str)
    numbers_str = re.sub(r'^\.?-+', '', numbers_str).strip()

    # *** FIX for "od nr 1 do 45" ***
    # Updated regex to handle optional "nr"
    range_match = re.match(r'od\s+(?:nr\s+)?(\d+)\s+do\s+(?:nr\s+)?(\d+)', numbers_str, re.IGNORECASE)
    if range_match:
        start = int(range_match.group(1))
        end = int(range_match.group(2))
        for num in range(start, end + 1):
            # *** FIX: Return just the number, street is already known ***
            buildings.append((street, str(num)))
        return buildings

    annotation_match = re.match(r'^([^\(]+)', numbers_str)
    if annotation_match:
        numbers_str = annotation_match.group(1).strip()

    # *** FIX for "124/1-4" ***
    range_slash_match = re.match(r'^(\d+)/(\d+)-(\d+)$', numbers_str)
    if range_slash_match:
        base = range_slash_match.group(1)
        try:
            start = int(range_slash_match.group(2))
            end = int(range_slash_match.group(3))
            if start <= end:
                for num in range(start, end + 1):
                    buildings.append((street, f"{base}/{num}"))
                return buildings
        except ValueError:
            pass

    # *** NEW/IMPROVED logic for lists like "53 oraz 58" or "12B, C, D" ***
    if 'oraz' in numbers_str.lower() or (',' in numbers_str and re.match(r'^\d+', numbers_str)):
        nums = re.split(r'\s*,\s*|\s+oraz\s+', numbers_str)
        first_num_match = re.match(r'^(\d+)([A-Za-z]*)$', nums[0].strip())

        if first_num_match:
            base_num_str = first_num_match.group(1)

            for num_str in nums:
                num_str = num_str.strip()
                if not num_str: continue

                # if it's just a letter, e.g. "C" (from "12B, C, D")
                if re.match(r'^[A-Za-z]$', num_str) and base_num_str:
                    buildings.append((street, f"{base_num_str}{num_str}"))
                # if it's a full number or suffix, e.g. "58" or "12B" or "27C"
                elif re.match(r'^\d*[A-Za-z\d/\s]*$', num_str):
                    buildings.append((street, num_str))
            if buildings:
                return buildings
        pass

    single_match = re.match(r'^(\d+)([A-Za-z/\d\s]*)$', numbers_str)
    if single_match:
        base_number = single_match.group(1)
        suffix = single_match.group(2).strip()
        building_number = base_number + (' ' if ' ' in numbers_str else '') + suffix
        buildings.append((street, building_number))
        return buildings

    if re.match(r'^[A-Za-ząćęłńóśźżĆŁŃÓŚŹŻ][A-Za-ząćęłńóśźżĆŁŃÓŚŹŻ\d/]*$', numbers_str, re.IGNORECASE):
        buildings.append((street, numbers_str))
        return buildings

    if not buildings:
        buildings.append((street, numbers_str))

    return buildings


def transform_tauron_data(responses_and_voivodeships: list[tuple[dict, str]]) -> dict:
    """
    Transforms a list of Tauron API responses into the target nested dictionary.
    """
    transformed_data = {}  # Initialize the final dictionary once

    # Iterate over the new list of (response, voivodeship) tuples
    for response, voivodeship in responses_and_voivodeships:

        # Ensure the voivodeship key exists in the dictionary
        if voivodeship not in transformed_data:
            transformed_data[voivodeship] = {}

        outage_items = response.get('OutageItems', [])

        for item in outage_items:
            try:
                start_date = item.get('StartDate')
                end_date = item.get('EndDate')
                message = item.get('Message')

                if not all([start_date, end_date, message]):
                    continue

                interval_str = f"{start_date} - {end_date}"

                cleaned_message = preprocess_tauron_message(message)
                if not cleaned_message:
                    continue

                (parsed_city, building_tuples) = parse_tauron_locations(cleaned_message)

                if not parsed_city or parsed_city.lower() == "uzgodniono z odbiorcą":
                    continue

                city_key = parsed_city
                buildings_list = []

                for street, num in building_tuples:
                    location_name = street

                    if street == parsed_city:
                        location_name = num if num != "B/N" else street
                    elif num != "B/N":
                        location_name = f"{street} {num}"

                    if location_name not in buildings_list:
                        buildings_list.append(location_name)

                buildings_list = [b.replace("B/N", "").strip() for b in buildings_list]
                buildings_list = list(dict.fromkeys(b for b in buildings_list if b))

                # *** FIX: Prepend city name ONLY if building is purely numeric ***
                for i, building in enumerate(buildings_list):
                    # Check if it's ONLY digits (like "102", "121")
                    # Using ^\d+$ to match only digits, not "1 Maja"
                    if re.match(r'^\d+$', building):
                        buildings_list[i] = f"{parsed_city} {building}"

                if not buildings_list or (len(buildings_list) == 1 and buildings_list[0] == parsed_city):
                    buildings_list = [parsed_city]
                elif len(buildings_list) > 1 and parsed_city in buildings_list:
                    buildings_list.remove(parsed_city)

                shutdown_details = {
                    "interval": interval_str,
                    "buildings": buildings_list,
                }

                if city_key not in transformed_data[voivodeship]:
                    transformed_data[voivodeship][city_key] = []

                transformed_data[voivodeship][city_key].append(shutdown_details)

            except Exception as e:
                logger.exception(f"Error processing OutageId {item.get('OutageId')}: {e}")

    return transformed_data


def get_tauron_planned_shutdowns(from_date: datetime, to_date: datetime):
    """
    voivodeship:
        - city:
            - interval
                - buildings: {}

    """

    from_date = format_for_tauron(from_date)
    to_date = format_for_tauron(to_date)

    base_url = "https://www.tauron-dystrybucja.pl/waapi/outages/area?"

    voivodeship_powiat_GAID_map = json.load(open('source/tauron_voivodeship_powiat_map.json', 'r', encoding='utf-8'))

    responses_and_voivodeships = []

    for voivodeship_dict in voivodeship_powiat_GAID_map[:1]:
        voivodeship = list(voivodeship_dict['voivodeship'].keys())[0]
        voivodeship_GAID = list(voivodeship_dict['voivodeship'].values())[0]

        logger.info(f"Province: {voivodeship} with GAID: {voivodeship_GAID}")

        for district, district_GAID in voivodeship_dict['districts'].items():
            # logger.info(f"\tDistrict: {district} with GAID: {district_GAID}")
            request_url = f"{base_url}&provinceGAID={voivodeship_GAID}&districtGAID={district_GAID}&fromDate={from_date}&toDate={to_date}&_=1760714469806"
            response = requests.get(request_url)

            try:
                resp_json = response.json()

                print(request_url)

                responses_and_voivodeships.append((resp_json, voivodeship))

            except Exception as e:
                logger.exception(f"Exception making request to {request_url}:\n {e}")

            time.sleep(0.5)

    return transform_tauron_data(responses_and_voivodeships)


# Convert to the required format: "YYYY-MM-DDTHH:MM:SS.sssZ"
def format_for_tauron(dt: datetime) -> str:
    # Keep UTC timezone, format with milliseconds and replace +00:00 → Z
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


if __name__ == "__main__":
    # infer_powiat_GAIDs()
    from_date = datetime(year=2025, month=10, day=24, tzinfo=timezone.utc)
    to_date = datetime(year=2025, month=10, day=27, tzinfo=timezone.utc)
    res = get_tauron_planned_shutdowns(from_date, to_date)
    json.dump(res, sys.stdout, ensure_ascii=False, indent=4)
