import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
import json
import time
import re

import requests

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


def parse_locations(line: str) -> tuple[str, list[str]]:
    def expand_range(match: re.Match) -> str:
        try:
            start = int(match.group(1))
            end = int(match.group(2))
            if start > end:
                start, end = end, start
            return ', '.join(str(i) for i in range(start, end + 1))
        except ValueError:
            return match.group(0)

    def is_full_name(item: str) -> bool:
        if not re.search(r'[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]', item):
            return False
        if re.match(r'[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]{2,}', item):
            return True
        if re.match(r'\d', item) and re.search(r'[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ]{2,}', item):
            return True
        return False

    def get_base_name(name: str) -> str:
        last_space_idx = name.rfind(' ')
        if last_space_idx == -1:
            return name
        suffix = name[last_space_idx + 1:]
        if re.search(r'\d', suffix) or re.fullmatch(r'[IVXLC]+', suffix, re.IGNORECASE):
            base = name[:last_space_idx].strip()
            return base if base else name
        else:
            return name

    def clean_city_name(city: str) -> str:
        # Handle Wrocław Fabryczna, Wrocław Psie Pole, etc.
        city = re.sub(r'^(Wrocław)\s+(Fabryczna|Psie Pole|Krzyki|Śródmieście)', r'\1', city, flags=re.IGNORECASE)
        # Handle "Kościerzyna-Wybudowanie" (from first dataset)
        city = re.sub(r'(-Wybudowanie|-Kolonia)$', '', city, flags=re.IGNORECASE)
        # Handle "Kościerzyna, Markubowo" (from first dataset)
        city = re.sub(r'(,\s*[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ ]+)$', '', city)
        return city.strip()

    # --- Main Function ---

    line = line.strip().strip('.')
    if line.startswith('2025-') or not line or line == 'bez transformatora' or line == 'Uzgodniono z odbiorcą':
        return ("", [])

    # Clean comments and non-location data first
    clean_line = re.sub(
        r'(- chwilowe.*|-awaria.*|pozbawione.*|w związku.*|Trwa lokalizacja.*|Uszkodzony.*|Na miejscu.*|i działki przyległe|i wszystkie do niej przyległe|\.$)',
        '', line, flags=re.IGNORECASE).strip()
    clean_line = re.sub(r'\b(dz\.|działk[ia]|obręb działek)[\s\w/,-]*', '', clean_line, flags=re.IGNORECASE)
    clean_line = re.sub(r'\b(numery|numeru|numer|nr)\b', '', clean_line, flags=re.IGNORECASE)

    # --- City Extraction ---
    extracted_city = ""
    # Find the very first text block before a keyword, comma, or colon
    city_match = re.match(r'^([\w\s-]+?)(?=\s*(ulica|ulice|ul\.|\,|:)|$)', clean_line.strip())
    if city_match:
        base_name = city_match.group(1).strip()
        extracted_city = clean_city_name(base_name)

    # --- Building Parsing (Continue from previous logic) ---

    # Standardize keywords on the *already cleaned* line
    proc_line = re.sub(r'\b(od)\b', 'od', clean_line, flags=re.IGNORECASE)
    proc_line = re.sub(r'\b(do)\b', 'do', proc_line, flags=re.IGNORECASE)
    proc_line = re.sub(r'(\sod\s)', ' od ', proc_line)
    proc_line = re.sub(r'(\sdo\s)', ' do ', proc_line)

    # Expand ranges
    proc_line = re.sub(r'od (\d+) do (\d+)', expand_range, proc_line, flags=re.IGNORECASE)

    # Standardize separators and keywords
    proc_line = proc_line.replace(':', ',')
    proc_line = re.sub(r'\b(miejscowoś[cć]|miejscowości)\b', '', proc_line, flags=re.IGNORECASE)
    proc_line = re.sub(r'\b(ulic[ea]|ul\.)\b', ' STREETKEYWORD ', proc_line, flags=re.IGNORECASE)

    proc_line = re.sub(r'\s{2,}', ' ', proc_line).strip()
    proc_line = proc_line.strip(',')

    items = [s.strip() for s in proc_line.split(',') if s.strip()]
    buildings: list[str] = []

    current_context_name = ""
    in_street_context = False

    for item in items:
        if "STREETKEYWORD" in item:
            in_street_context = True
            item = item.replace("STREETKEYWORD", "").strip()

            # This regex checks if the item *after* STREETKEYWORD
            # is "CityName StreetName" or just "StreetName"
            # We discard the "CityName" part if it's present, as per rules
            city_street_match = re.match(r'^[A-ZŻŹĆŃÓŁĘĄŚ][\w\s-]*?\s+([A-ZŻŹĆŃÓŁĘĄŚ\d].*)', item)

            if city_street_match:
                street_name = city_street_match.group(1).strip()
                buildings.append(street_name)
                current_context_name = get_base_name(street_name)
            elif item:
                # Item is just a street name
                buildings.append(item)
                current_context_name = get_base_name(item)
            else:
                # e.g., "Osiecznica, ulice:, Zacisze..." -> item is empty
                current_context_name = ""

        elif is_full_name(item):
            if in_street_context:
                buildings.append(item)
                current_context_name = get_base_name(item)
            else:
                # Not in street context, so this is a locality.
                # We *include* the locality name.
                cleaned_item = clean_city_name(item)
                buildings.append(cleaned_item)
                current_context_name = get_base_name(cleaned_item)

        else:
            # Item is just a number or suffix
            if current_context_name:
                buildings.append(f"{current_context_name} {item}")

    final_buildings = [b.strip() for b in buildings if b.strip()]

    final_buildings = list(set(final_buildings))

    return (extracted_city, final_buildings)


def transform_tauron_data(responses_and_voivodeships: list[tuple[dict, str]]) -> dict:
    """
    Transforms a list of Tauron API responses into the target nested dictionary.
    """
    transformed_data = {}  # Initialize the final dictionary once

    # Iterate over the new list of (response, voivodeship) tuples
    for response, voivodeship in responses_and_voivodeships:

        # Ensure the voivodeship key exists in the dictionary
        if voivodeship not in transformed_data:
            transformed_data[voivodeship] = defaultdict(list)

        outage_items = response.get('OutageItems', [])

        for item in outage_items:
            try:
                start_date = item.get('StartDate')
                end_date = item.get('EndDate')
                message = item.get('Message')

                if not all([start_date, end_date, message]):
                    continue

                city_name, location_list = parse_locations(message)

                shutdown_details = {
                    "interval": {
                        'from_date': start_date,
                        'to_date': end_date,
                    },
                    "locations": location_list,
                }

                transformed_data[voivodeship][city_name].append(shutdown_details)

            except Exception as e:
                logger.exception(f"Error processing OutageId {item.get('OutageId')}: {e}")

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

    voivodeship_powiat_GAID_map = json.load(open('source/tauron_voivodeship_powiat_map.json', 'r', encoding='utf-8'))

    responses_and_voivodeships = []

    for voivodeship_dict in voivodeship_powiat_GAID_map:
        voivodeship = list(voivodeship_dict['voivodeship'].keys())[0]
        voivodeship_GAID = list(voivodeship_dict['voivodeship'].values())[0]

        logger.info(f"Province: {voivodeship} with GAID: {voivodeship_GAID}")

        for district, district_GAID in voivodeship_dict['districts'].items():
            logger.info(f"\tDistrict: {district} with GAID: {district_GAID}")
            request_url = f"{base_url}&provinceGAID={voivodeship_GAID}&districtGAID={district_GAID}&fromDate={from_date}&toDate={to_date}&_=1760714469806"
            response = requests.get(request_url)

            try:
                resp_json = response.json()
                # print(resp_json)
                #
                # print(request_url)

                responses_and_voivodeships.append((resp_json, voivodeship))

                # print(resp_json[''])
            except Exception as e:
                # logger.exception(f"Exception making request to {request_url}:\n {e}")
                pass
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
