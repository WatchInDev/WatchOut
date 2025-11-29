import os
from datetime import datetime, timedelta
from scrapers import get_tauron_planned_shutdowns, get_energa_planned_shutdowns, fetch_meteorological_warnings
import requests
import azure.functions as func
from logging_config import setup_loguru

setup_loguru()

from loguru import logger


def electricity_outages_fetching():
    try:
        # tauron = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))
        energa = get_energa_planned_shutdowns()

        # tauron_res = {"outagesResponse": tauron, "provider": 'tauron'}
        energa_res = {"outagesResponse": energa, "provider": 'energa'}

        # print([tauron_res, energa_res])
        # print([energa_res])

        # return [tauron_res, energa_res]
        return [energa_res]

    except Exception as e:
        logger.exception(f"Exception during data scraping or retrieving: {e}")


def meteorological_warnings_fetching():
    try:
        imgw = fetch_meteorological_warnings()
        return imgw
    except Exception as e:
        logger.exception(f"Exception during data retrieving: {e}")


app = func.FunctionApp()


@app.timer_trigger(schedule="0 0 3 * * *", arg_name="myTimer", run_on_startup=True,
                   use_monitor=False)
def send_data_to_server(myTimer: func.TimerRequest) -> None:
    if myTimer.past_due:
        logger.info('The timer is past due!')

    base_url = os.getenv("SERVER_BASE_INTERNAL_URL", '')
    electricity_url = os.getenv("ELECTRICITY_OUTAGES_ENDPOINT", '/warnings/electricity')
    weather_url = os.getenv("WEATHER_ALARMS_ENDPOINT", '/warnings/weather')

    token = os.getenv("INTERNAL_API_KEY", '123')
    electricity = electricity_outages_fetching()
    imgw = meteorological_warnings_fetching()

    try:
        resp1 = requests.post(f"{base_url}{electricity_url}", json=electricity, headers={'INTERNAL_API_KEY': token})
        resp2 = requests.post(f"{base_url}{weather_url}", json=imgw, headers={'INTERNAL_API_KEY': token})

        resp1.raise_for_status()
        resp2.raise_for_status()
        logger.info('Data sent successfully')
    except Exception as e:
        logger.exception(f"Exception during data sending to server: {e}")

    logger.info('Python timer trigger function executed.')


if __name__ == '__main__':
    base_url = os.getenv("SERVER_BASE_INTERNAL_URL",
                         'https://watchoutapi-h2c2bxesd6fzc2he.polandcentral-01.azurewebsites.net/api/v1/internal')
    electricity_url = os.getenv("ELECTRICITY_OUTAGES_ENDPOINT", '/warnings/electricity')
    weather_url = os.getenv("WEATHER_ALARMS_ENDPOINT", '/warnings/weather')

    token = os.getenv("INTERNAL_API_KEY", '123')
    electricity = electricity_outages_fetching()
    imgw = meteorological_warnings_fetching()

    try:
        resp1 = requests.post(f"{base_url}{electricity_url}", json=electricity, headers={'INTERNAL_API_KEY': token})
        resp2 = requests.post(f"{base_url}{weather_url}", json=imgw, headers={'INTERNAL_API_KEY': token})

        resp1.raise_for_status()
        resp2.raise_for_status()
        logger.info('Data sent successfully')
    except Exception as e:
        logger.exception(f"Exception during data sending to server: {e}")