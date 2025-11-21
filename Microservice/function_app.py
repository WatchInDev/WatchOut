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
        tauron = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))
        energa = get_energa_planned_shutdowns()

        return {"tauron": tauron, "energa": energa}

    except Exception as e:
        logger.exception(f"Exception during data scraping or retrieving: {e}")


def meteorological_warnings_fetching():
    try:
        imgw = fetch_meteorological_warnings()
        return {"imgw": imgw}
    except Exception as e:
        logger.exception(f"Exception during data retrieving: {e}")




app = func.FunctionApp()

@app.timer_trigger(schedule="0 0 3 * * *", arg_name="myTimer", run_on_startup=False,
              use_monitor=False) 
def send_data_to_server(myTimer: func.TimerRequest) -> None:
    if myTimer.past_due:
        logger.info('The timer is past due!')

    url = os.getenv("URL", '')
    token = os.getenv("SERVER_AUTH_TOKEN", '')
    electricity = electricity_outages_fetching()
    imgw = meteorological_warnings_fetching()

    payload = {'electricity': electricity, 'weather': imgw}

    try:
        requests.post(url, json=payload, headers={'Authorization': f'Bearer {token}'})
        response.raise_for_status()
        logger.info('Data sent successfully')
    except Exception as e:
        logger.exception(f"Exception during data sending to server: {e}")

    logger.info('Python timer trigger function executed.')