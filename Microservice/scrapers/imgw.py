import json
import sys

import pandas as pd
import requests
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from logging_config import setup_loguru

setup_loguru()

from loguru import logger

utc_zone = timezone.utc
poland_zone = ZoneInfo("Europe/Warsaw")


def construct_teryt_id_powiat_name_map():
    df = pd.read_csv('source/TERC.csv',
                     delimiter=';',
                     dtype={
                         'WOJ': str,
                         'POW': str,
                         'GMI': str
                     })

    df['TERYT_ID'] = df['WOJ'] + df['POW']

    df = df[df['GMI'].isna() & df['POW'].notna()]

    powiat_map = df.set_index('TERYT_ID')['NAZWA'].to_dict()

    with open('source/teryt_id_powiat_name_map.json', 'w', encoding='utf-8') as file:
        json.dump(powiat_map, file, indent=4, ensure_ascii=False)


def load_teryt_map():
    return json.load(open('source/teryt_id_powiat_name_map.json', encoding='utf-8'))


def fetch_meteorological_warnings():
    url = "https://danepubliczne.imgw.pl/api/data/warningsmeteo"

    teryt_map = load_teryt_map()

    try:
        response_json = requests.get(url).json()
        # json.dump(response_json, sys.stdout, indent=4, ensure_ascii=False)

        for warning in response_json:
            del warning['id']
            del warning['stopien']

            warning['powiaty'] = []
            for teryt_id in warning['teryt']:
                warning['powiaty'].append(teryt_map.get(teryt_id, ''))

            del warning['teryt']

            date_fields = ['obowiazuje_do', 'obowiazuje_od', 'opublikowano']

            for field in date_fields:
                if field in warning and warning[field]:
                    try:
                        utc_dt = datetime.strptime(warning[field], '%Y-%m-%d %H:%M:%S')
                        aware_utc_dt = utc_dt.replace(tzinfo=utc_zone)
                        local_dt = aware_utc_dt.astimezone(poland_zone)
                        warning[field] = local_dt.strftime('%Y-%m-%dT%H:%M')

                    except ValueError:
                        logger.exception(f"Could not parse date: {warning[field]}")

        # print(response_json)
        return response_json

    except Exception as e:
        logger.exception(f"Exception during data scraping or retrieving: {e}")


if __name__ == "__main__":
    res = fetch_meteorological_warnings()
    print(res)
