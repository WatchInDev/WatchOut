import os
from datetime import datetime, timedelta
from scrapers import get_tauron_planned_shutdowns, get_energa_planned_shutdowns, fetch_meteorological_warnings
import requests
import azure.functions as func


def electricity_outages_fetching():
    try:
        energa = get_energa_planned_shutdowns()
        tauron = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))

        tauron_res = {"outagesResponse": tauron, "provider": 'tauron'}
        energa_res = {"outagesResponse": energa, "provider": 'energa'}

        return [tauron_res, energa_res]

    except Exception as e:
        print(f"Exception during data scraping or retrieving: {e}")


def meteorological_warnings_fetching():
    try:
        imgw = fetch_meteorological_warnings()
        return imgw
    except Exception as e:
        print(f"Exception during data retrieving: {e}")


app = func.FunctionApp()


@app.timer_trigger(schedule="0 0 3 * * *", arg_name="myTimer", run_on_startup=True,
                   use_monitor=False)
def send_data_to_server(myTimer: func.TimerRequest) -> None:
    if myTimer.past_due:
        print('The timer is past due!')

    base_url = os.getenv("SERVER_BASE_INTERNAL_URL", '')
    electricity_url = os.getenv("ELECTRICITY_OUTAGES_ENDPOINT", '/warnings/electricity')
    weather_url = os.getenv("WEATHER_ALARMS_ENDPOINT", '/warnings/weather')

    token = os.getenv("INTERNAL_API_KEY", '')
    electricity = electricity_outages_fetching()
    imgw = meteorological_warnings_fetching()

    try:
        resp1 = requests.post(f"{base_url}{electricity_url}", json=electricity, headers={'INTERNAL_API_KEY': token})
        resp2 = requests.post(f"{base_url}{weather_url}", json=imgw, headers={'INTERNAL_API_KEY': token})

        resp1.raise_for_status()
        resp2.raise_for_status()
        print('Data sent successfully')
    except Exception as e:
        print(f"Exception during data sending to server: {e}")

    print('Python timer trigger function executed.')
