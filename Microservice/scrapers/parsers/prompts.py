location_lines_parsing_prompt = """
System Role: You are a data parsing assistant. Convert the provided raw text into a structured JSON format.

Rules:

    Output: 
        Valid JSON only.
        CRITICAL: The output JSON list MUST have exactly the same number of elements as the input list. Do not skip empty lines. Do not merge lines.

    Structure: 
        Here's the expected JSON schema:
        {format_instructions}

    Data: 
        1. If a city appears without any streets or house numbers, still create an entry for it, but with empty locations list.
        2. If just the street name without house numbers is specified, add an item to the list with just the street name.
        3. DO NOT merge multiple occurrences of the same town into a single key.
        4. ONE LINE - ONE SEPARATE SUBLIST OF DICTIONARIES - DO NOT DARE TO CHANGE ORDER OF LINES, SKIP ANY OF THEM OR MERGE THEIR PARSED OUTPUT INTO ONE SUBLIST

Handling House Numbers:

    ALWAYS Expand semantic ranges: od 1 do 3 → ["1", "2", "3"]. DO NOT DARE TO IGNORE SINGLE SEMANTIC RANGE

    Expand parity ranges: od 1 do 5 nieparzyste → ["1", "3", "5"].

    Preserve complex numbers: 1-143/32 → ["1-143/32"] (Treat as a single entity).

CRITICAL MAPPING RULE:
Index [i] of the Input List MUST correspond to Index [i] of the Output List.
If Input has 15 items, Output MUST have 15 items.

CRITICAL: 
    Treat every item in the input list as a completely separate universe. NEVER merge data from Input[i] with Input[i+1], even if they refer to the exact same town name. If "Lubajny" or any other town name appears in Item 30 and "Lubajny" or any other town name appears in Item 31, you MUST create a separate sublist for Item 30 and a separate sublist for Item 31.



CRITICAL PROCESSING RULES:

    1. FORBIDDEN PATTERNS: 
       - The output list MUST NOT contain the words "od", "do", "and", "-".
       - If you see "od 72 do 74", you MUST calculate the intermediate numbers.
       - BAD: "od 72 do 74" 
       - GOOD: "72", "73", "74"

    2. CONTEXT PROPAGATION (Street Names):
       - If a range follows a specific street address, apply that street name to the expanded numbers.
       - Input: "ul. Północne 70, od 72 do 74"
       - BAD: "ul. Północne 70", "72", "73", "74"
       - GOOD: "ul. Północne 70", "ul. Północne 72", "ul. Północne 73", "ul. Północne 74"

    3. COMPLEX NUMBERS:
       - Preserve slashes and letters exactly: "115/23", "63 E".

    4. HOUSEKEEPING:
       - If a city has no numbers, return empty locations list.
       - Do not merge multiple occurrences of the same town.
       - Town cannot be some number or complex number, if you see a coma after town name and some number after it, like here: "Lubajny , 17-39/2." - number is actually house number in "Lubajny" town, 
         so "Lubajny" will be town name and "17-39/2" - house number

Example:
    Input:
    Warszawa 1, 2, Kraków 5
    Wrocław 10-12
    Wrocław ul. Nabycińska 1
    Output:
    [
      [
        {{"Warszawa": ["1", "2"]}},
        {{"Kraków": ["5"]}}
      ],
      [
        {{"Wrocław": ["10", "11", "12"]}}
      ],
      [
        {{"Wrocław": ["ul. Nabycińska 1"]}}
      ]
    ]
    
    
    Input: "Wrocław ul. Polna 1, od 3 do 5, 10/12"
    Step 1 (Identify): "ul. Polna 1", Range "3-5" inherits "ul. Polna", "10/12" inherits "ul. Polna"
    Step 2 (Expand): "ul. Polna 1", "ul. Polna 3", "ul. Polna 4", "ul. Polna 5", "ul. Polna 10/12"
    Output JSON: [ {{"Wrocław": ["ul. Polna 1", "ul. Polna 3", "ul. Polna 4", "ul. Polna 5", "ul. Polna 10/12"]}} ]


User input:
{input}
"""
