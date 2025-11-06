from datetime import datetime, timedelta
from scrapers import get_tauron_planned_shutdowns, get_energa_planned_shutdowns, fetch_meteorological_warnings


def electricity_outages_fetching():
    try:
        tauron = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))
        energa = get_energa_planned_shutdowns()

        return {"tauron": tauron, "energa": energa}

    except Exception as e:
        print(f"Exception during data scraping or retrieving: {e}")


def meteorological_warnings_fetching():
    try:
        imgw = fetch_meteorological_warnings()
        return {"imgw": imgw}
    except Exception as e:
        print(f"Exception during data retrieving: {e}")
