from datetime import datetime, timedelta
from scrapers import get_tauron_planned_shutdowns, get_energa_planned_shutdowns
import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def electricity_outages_fetching():
    try:
        # tauron = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))
        energa = get_energa_planned_shutdowns()

        # return {"tauron": tauron, "energa": energa}
        return {"energa": energa}
        # return "test"
    #
    except Exception as e:
        print(f"Exception during data scraping or retrieving: {e}")

if __name__ == "__main__":
    print(json.dumps(electricity_outages_fetching(), ensure_ascii=False))
