import os
import asyncio
import json
from datetime import datetime, timedelta

from azure.eventhub import EventData
from azure.eventhub.aio import EventHubProducerClient
import azure.functions as func
from scrapers import get_tauron_planned_shutdowns, get_energa_planned_shutdowns

EVENT_HUB_CONNECTION_STR = os.environ.get("EVENT_HUB_CONNECTION_STR")
EVENT_HUB_NAME = os.environ.get("EVENT_HUB_NAME")

if not EVENT_HUB_CONNECTION_STR or not EVENT_HUB_NAME:
    raise ValueError("EVENT_HUB_CONNECTION_STR и EVENT_HUB_NAME must be setup in Function App config.")


async def send_data_to_event_hub(data_list):
    async with EventHubProducerClient.from_connection_string(
            conn_str=EVENT_HUB_CONNECTION_STR,
            eventhub_name=EVENT_HUB_NAME
    ) as producer:

        print(f"Connected to Event Hub: {EVENT_HUB_NAME}. Creating package...")

        event_data_batch = await producer.create_batch()

        for data_item in data_list:
            json_payload = json.dumps(data_item)
            event = EventData(json_payload)

            try:
                event_data_batch.add(event)
            except ValueError:
                await producer.send_batch(event_data_batch)
                event_data_batch = await producer.create_batch()
                event_data_batch.add(event)

        if len(event_data_batch) > 0:
            await producer.send_batch(event_data_batch)

        print(f"Successfully sent {len(data_list)} messages..")


app = func.FunctionApp()


@app.timer_trigger(schedule="0 * * * * *", arg_name="myTimer", run_on_startup=True,
              use_monitor=False) 
async def main(myTimer: func.TimerRequest) -> None:
    try:
        tauron = get_tauron_planned_shutdowns(datetime.now(), datetime.now() + timedelta(days=7))
        energa = get_energa_planned_shutdowns()

        if tauron:
            await send_data_to_event_hub(tauron)
        if energa:
            await send_data_to_event_hub(energa)

    except Exception as e:
        print(f"Exception during data scraping or retrieving: {e}")


if __name__ == "__main__":
    asyncio.run(main())
