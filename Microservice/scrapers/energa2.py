import sys
from datetime import datetime

import nltk
import re
import json

import requests

# Ensure NLTK data is available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')


class EnergaNLTKParser:
    def __init__(self):
        # NLTK Tokenizer that keeps alphanumeric combos (97A, 1/A) together
        # but treats commas and spaces as separators
        self.tokenizer = nltk.RegexpTokenizer(r'[\w\-/]+')

    def expand_range(self, start_token, end_token, modifier=None):
        """Unwraps ranges like 'od 94 do 97'."""
        results = []
        try:
            # Extract integers from tokens like "94A" -> 94 for range logic
            s = int(re.search(r'\d+', start_token).group())
            e = int(re.search(r'\d+', end_token).group())

            step = 1
            if modifier:
                if 'nieparzyste' in modifier or 'np.' in modifier:
                    step = 2
                    if s % 2 == 0: s += 1
                elif 'parzyste' in modifier or 'p.' in modifier:
                    step = 2
                    if s % 2 != 0: s += 1

            if s <= e:
                for i in range(s, e + 1, step):
                    results.append(str(i))
            else:
                results.append(f"{start_token}-{end_token}")
        except:
            results.append(f"{start_token}-{end_token}")

        return results

    def parse_line(self, line):
        if not line or line.startswith("C:\\") or len(line) < 3: return []
        if line.endswith('.'): line = line[:-1]

        # 1. Use NLTK to get a clean stream of tokens
        tokens = self.tokenizer.tokenize(line)
        if not tokens: return []

        # 2. Determine Mode (Village vs Street) and Split Header
        # We look for 'ulica'/'ulice' or the first digit
        split_index = 0
        mode = "village"

        # Check for street keywords
        street_keyword_indices = [i for i, t in enumerate(tokens) if t.lower() in ['ulica', 'ulice', 'ul']]

        if street_keyword_indices:
            mode = "street"
            split_index = street_keyword_indices[0] + 1  # Start data after 'ulice'
            # For formatting "Street Number", we don't need the City name
        else:
            # Village mode: We need the City name as the "Street" context
            # Find first digit to separate City from Numbers
            first_digit_idx = next((i for i, t in enumerate(tokens) if re.search(r'\d', t)), None)
            if first_digit_idx is not None:
                split_index = first_digit_idx
                # The tokens before the digit are the Village Name
                current_context = " ".join(tokens[:first_digit_idx])
            else:
                # No digits, assume list of towns. Return whole line split by commas
                return [t.strip() for t in line.split(',')]

        # If we are in street mode, current_context starts empty until we find a street name
        if mode == "street":
            current_context = ""

            # 3. Process Data Tokens
        # We process the original line string for splitting by comma,
        # because NLTK token stream loses the comma boundaries which are crucial here.
        # We separate the "Header" part we identified above from the "Data" part.

        # Reconstruct the header/data split using string manipulation based on tokens found
        # (This is safer than NLTK for splitting chunks)

        if mode == "street":
            # Regex split after "ulice" or "ulica"
            match = re.search(r'(ulica|ulice|ul\.)', line, re.IGNORECASE)
            if match:
                data_part = line[match.end():]
            else:
                data_part = line
        else:
            # Village mode: split at first digit
            match = re.search(r'\d', line)
            if match:
                data_part = line[match.start():]
            else:
                return []  # Should have been caught earlier

        chunks = [c.strip() for c in data_part.split(',')]
        final_locations = []

        for chunk in chunks:
            if not chunk: continue

            # Sub-tokenize this chunk to handle ranges/modifiers
            chunk_tokens = self.tokenizer.tokenize(chunk)
            if not chunk_tokens: continue

            # Check for Range (od X do Y)
            if 'od' in chunk and 'do' in chunk:
                try:
                    # Find indices in the text chunk
                    od_match = re.search(r'od\s+(\S+)', chunk)
                    do_match = re.search(r'do\s+(\S+)', chunk)
                    if od_match and do_match:
                        start_token = od_match.group(1).strip(',')
                        end_token = do_match.group(1).strip(',')

                        modifier = None
                        if 'nieparzyste' in chunk: modifier = 'nieparzyste'
                        if 'parzyste' in chunk and 'nieparzyste' not in chunk: modifier = 'parzyste'

                        expanded = self.expand_range(start_token, end_token, modifier)
                        for num in expanded:
                            final_locations.append(f"{current_context} {num}".strip())
                        continue
                except:
                    pass

                    # Check if this chunk is a new Street Name (Street Mode only)
            # Logic: No digits in chunk
            has_digit = re.search(r'\d', chunk)

            if mode == "street" and not has_digit:
                current_context = chunk
                # In street mode, mentioning the street often implies the whole street
                # but if you only want Street + Number, we might skip this unless numbers follow.
                # However, usually lists imply "All of Street X".
                # If you strictly want Street + Number, we only append if it has a number.
                # But typically "Gdyńska, Turystyczna" means "Gdyńska (whole), Turystyczna (whole)".
                # I will output just the street name if no number is present.
                final_locations.append(current_context)

            elif has_digit:
                # It has numbers.
                # Does it define a new street? e.g. "Krakowska 29" inside a list
                match_street_inline = re.match(r'^([^\d]+)\s+(.*)', chunk)

                numbers_to_parse = chunk
                prefix = current_context

                if mode == "street" and match_street_inline:
                    # Found a street name override: "Krakowska 29"
                    prefix = match_street_inline.group(1).strip()
                    numbers_to_parse = match_street_inline.group(2).strip()
                    # Update global context? Usually lists are "A, B 1, 2".
                    # If "A 1, B 1", the context switches.
                    current_context = prefix

                elif mode == "village":
                    # Check for "Zielona Chocina-389/7" style overrides
                    # If the text part is different from the main village name?
                    # The prompt implies we just want the string as is if it's standalone.
                    pass

                # Extract individual items (tokens)
                # We reuse the tokenizer on the number part
                num_tokens = self.tokenizer.tokenize(numbers_to_parse)

                for t in num_tokens:
                    # Filter out non-address tokens if NLTK picked up "and" or similar?
                    # But here we just expect numbers/suffixes
                    if re.search(r'\d', t):
                        final_locations.append(f"{prefix} {t}".strip())

        return final_locations

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
        transformed_data = {}
        messages = []

        parser = EnergaNLTKParser()

        for shutdown in shutdown_list:
            try:
                voivodeship = 'a'
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
                    "locations": parser.parse_line(message),
                }

                print(message)

                if voivodeship not in transformed_data:
                    transformed_data[voivodeship] = {}

                if city not in transformed_data[voivodeship]:
                    transformed_data[voivodeship][city] = []

                transformed_data[voivodeship][city].append(shutdown_details)

            except Exception as e:
                print(f"Error processing shutdown guid {shutdown.get('guid')}: {e}")
        return transformed_data

    except Exception as e:
        # print(f'Error trying scraping shutdowns from Energa: {e}')
        raise e



if __name__ == '__main__':
    res = get_energa_planned_shutdowns()

    # json.dump(res, sys.stdout, ensure_ascii=False, indent=4)