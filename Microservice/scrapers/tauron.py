import sys
from collections import defaultdict
from datetime import datetime, timezone
import json
import io

import requests

# from Microservice.logging_config import setup_loguru
#
# setup_loguru()

sample_url = """
https://www.tauron-dystrybucja.pl/waapi/outages/area
?provinceGAID=2&districtGAID=1041&fromDate=2025-10-17T15:21:32.682Z&toDate=2025-10-22T15:21:32.682Z&_=1760714469806
"""

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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



import re
from typing import List, Tuple


def _clean_message(message: str) -> str:
    """Usuwa znany szum z początku i końca wiadomości."""
    message = re.sub(r'^(miejscowość|miejscowości)\s+', '', message, flags=re.IGNORECASE)
    message = message.strip().strip('.')

    noise_patterns = [
        r'\s*-\s*chwilowe przerwy.*$',
        r'\s*i działki przyległe\.*$',
        r'\s*oraz działki przyległe\.*$',
        r'\s*i przyległe\.*$',
        r'\s*pozbawione zasilania\.*$',
        r'\.$'
    ]
    for pattern in noise_patterns:
        message = re.sub(pattern, '', message, flags=re.IGNORECASE | re.DOTALL)
    return message.strip()


def _parse_range(start_s: str, end_s: str, modifier_str: str) -> List[int]:
    """Przetwarza ciągi znaków na listę numerów na podstawie modyfikatorów."""
    try:
        start = int(start_s)
        end = int(end_s)
    except ValueError:
        return []

    if end < start:
        start, end = end, start

    full_range = list(range(start, end + 1))
    modifier = modifier_str.lower()

    if 'nieparzyste' in modifier:
        return [n for n in full_range if n % 2 != 0]
    if 'parzyste' in modifier:
        return [n for n in full_range if n % 2 == 0]

    return full_range


def _unwrap_single_location_string(loc_str: str) -> List[str]:
    """Rozwija pojedynczy ciąg lokalizacji (np. "Główna od numeru 5 do 16")."""
    loc_str = loc_str.strip()

    # 1. Wzór "od...do": "od 121 do 135" LUB "od numeru 5 do 16"
    #    *** POPRAWKA: Dodano (?:nr |numeru )? ***
    m_od_do = re.search(r'od (?:nr |numeru )?(\d+) do (\d+)(.*)', loc_str, re.IGNORECASE)
    if m_od_do:
        prefix = loc_str[:m_od_do.start()].strip()
        numbers = _parse_range(m_od_do.group(1), m_od_do.group(2), m_od_do.group(3))
        return [f"{prefix} {n}".strip() for n in numbers] if prefix else [str(n) for n in numbers]

    # 2. Wzór "n-m": "Kielecka 1-10"
    m_dash = re.search(r'(\d+)-(\d+)(?![\w/])(.*)', loc_str, re.IGNORECASE)
    if m_dash:
        prefix = loc_str[:m_dash.start()].strip()
        numbers = _parse_range(m_dash.group(1), m_dash.group(2), m_dash.group(3))
        return [f"{prefix} {n}".strip() for n in numbers] if prefix else [str(n) for n in numbers]

    # 3. Wzór "numery 1, 2, 3": "ul. Świerkowa numery 51, 52, 53 oraz 58"
    m_numery = re.search(r'(?:numery|nr)\s+([\d\w,\sioraz]+)', loc_str, re.IGNORECASE)
    if m_numery:
        prefix = loc_str[:m_numery.start()].strip()
        num_list_str = re.sub(r'\s+(oraz|i)\s+', ',', m_numery.group(1), flags=re.IGNORECASE)
        numbers = [n.strip() for n in re.split(r'[\s,]+', num_list_str) if n.strip()]
        numbers = [n for n in numbers if n.lower() not in ('i', 'oraz')]
        return [f"{prefix} {n}".strip() for n in numbers]

    return [loc_str]


def _clean_final_location(loc: str) -> str:
    """
    *** NOWA FUNKCJA ***
    Agresywnie czyści końcowy ciąg lokalizacji z prefiksów miast,
    słów "ulica:" i wiodących dwukropków.
    """
    # 1. Usuń "Miasto ulice: ", "Miasto ulica: ", "Miasto: "
    #    (Szuka słów z wielkiej litery na początku, po których jest separator)
    loc = re.sub(r'^[A-ZĄĆĘŁŃÓŚŹŻ][\w\s-]*? (ulice|ulica|:)\s*', '', loc, flags=re.IGNORECASE)

    # 2. Usuń "ulice: ", "ulica: ", ": " (jeśli są na początku)
    #    (Nie usuwa "ul.", co jest pożądane)
    loc = re.sub(r'^(ulice|ulica|:)\s*', '', loc, flags=re.IGNORECASE)

    return loc.strip()


def parse_locations(message: str) -> Tuple[str, List[str]]:
    """
    Główna funkcja parsująca. Dzieli komunikat na miasto i lokalizacje
    bez polegania na statycznej liście miast.

    Zwraca: (nazwa_miasta, lista_lokalizacji)
    """

    if "bez transformatora" in message.lower():
        return "Nieznane", ["bez transformatora"]
    if "uzgodniono z odbiorcą" in message.lower():
        return "Nieznane", ["Uzgodniono z odbiorcą"]

    cleaned_message = _clean_message(message)
    if not cleaned_message:
        return "Nieznane", []

    city_name = "Nieznane"
    location_string = ""

    # 2. Heurystyka podziału
    separator_regex = r'(\s+(ul(ice|ica|\.)|al\.|os\.|dz\.|od\s|nr\s)|:|\s*,\s*(?=\d|od|dz|ul|al|os))'
    split_match = re.search(separator_regex, cleaned_message, re.IGNORECASE)

    if split_match:
        split_index = split_match.start()
        city_name = cleaned_message[:split_index].strip().strip(' ,:')
        location_string = cleaned_message[split_index:].strip().strip(' ,:')
    else:
        first_comma_index = cleaned_message.find(',')
        if first_comma_index != -1:
            last_space_index = cleaned_message.rfind(' ', 0, first_comma_index)
            if last_space_index != -1:
                city_name = cleaned_message[:last_space_index].strip()
                location_string = cleaned_message[last_space_index:].strip()
            else:
                city_name = cleaned_message[:first_comma_index].strip()
                location_string = cleaned_message[first_comma_index + 1:].strip()
        else:
            city_name = cleaned_message
            location_string = ""

    # 3. Przetwarzanie ciągu lokalizacji
    if not location_string:
        return city_name, []

    # Czyść początek ciągu lokalizacji (w pętli, na wypadek wielokrotnych prefiksów)
    prev_loc_string = None
    while prev_loc_string != location_string:
        prev_loc_string = location_string
        # Usuwa "ulice:", "ulica:", ":" ale zostawia "ul."
        location_string = re.sub(r'^(ulice|ulica|:)\s*', '', location_string, flags=re.IGNORECASE).strip()

    # *** POPRAWKA: Dodano (?:i|oraz) do splittera ***
    items = re.split(r'\s*,\s*|\s+(?:i|oraz)\s+', location_string, flags=re.IGNORECASE)

    final_locations_list = []
    current_street = ""

    for item in items:
        item = item.strip().strip('.')
        if not item:
            continue

        is_follow_on = re.match(r'^(\d+-\d+(?:[a-zA-Z])?|od\s|nr\s)?\d+[a-zA-Z]*$', item, re.IGNORECASE)

        full_loc_str = ""
        if is_follow_on and current_street:
            full_loc_str = f"{current_street} {item}"
        else:
            full_loc_str = item
            m_street = re.match(r'^(.*?)(\s+(\d|od|nr|dz\.))', item, re.IGNORECASE)
            if m_street:
                current_street = m_street.group(1).strip(': ')
            else:
                current_street = item.strip(': ')

        # Rozwiń element (np. "Główna od numeru 5 do 16")
        unwrapped_items = _unwrap_single_location_string(full_loc_str)

        # *** POPRAWKA: Czyść każdy element przed dodaniem ***
        for unwrapped in unwrapped_items:
            cleaned_loc = _clean_final_location(unwrapped)
            if cleaned_loc:  # Dodaj tylko jeśli coś zostało po czyszczeniu
                final_locations_list.append(cleaned_loc)

    # Ostateczne czyszczenie: usuń puste stringi i zduplikowane wpisy
    final_locations_list = sorted(list(set(filter(None, final_locations_list))))

    if (not city_name or city_name == "Nieznane") and final_locations_list:
        first_loc = final_locations_list[0]
        if not any(char.isdigit() for char in first_loc) and not re.search(r'(ul\.|od|dz\.)', first_loc, re.IGNORECASE):
            city_name = first_loc
            final_locations_list = final_locations_list[1:]
        elif not city_name or city_name == "Nieznane":
            city_name = "Nieznane"

    return city_name, final_locations_list


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
                # logger.exception(f"Error processing OutageId {item.get('OutageId')}: {e}")
                pass

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

    voivodeship_powiat_GAID_map = json.load(open('Microservice/scrapers/source/tauron_voivodeship_powiat_map.json', 'r', encoding='utf-8'))

    responses_and_voivodeships = []

    for voivodeship_dict in voivodeship_powiat_GAID_map[:1]:
        voivodeship = list(voivodeship_dict['voivodeship'].keys())[0]
        voivodeship_GAID = list(voivodeship_dict['voivodeship'].values())[0]

        for district, district_GAID in voivodeship_dict['districts'].items():
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
