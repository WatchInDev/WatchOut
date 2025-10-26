import os
import asyncio
import json
from datetime import datetime, timedelta
from scrapers import get_tauron_planned_shutdowns, get_energa_planned_shutdowns


async def electricityOutagesFetching() -> None:
    try:
        tauron = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))
        energa = get_energa_planned_shutdowns()



    except Exception as e:
        print(f"Exception during data scraping or retrieving: {e}")

