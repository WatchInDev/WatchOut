from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from serializers import *

app = FastAPI(
    title='Watchout microservice',
    description='A helper microservice for Watchout app that does:\n\n1.Scraping recent electricity shutdown data',
)


class Item(BaseModel):
    # text: str = None # None means optional
    text: str
    is_done: bool = False


items = []


@app.get("/")
def root():
    return {"Hello": "World"}


@app.post("/items")
def create_item(item: Item):
    items.append(item)
    return item


@app.get("/items", response_model=list[Item])
def list_items(limit: int = 10) -> list[Item]:
    return items[:limit]


@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    if item_id < len(items):
        return items[item_id]
    else:
        return HTTPException(status_code=404, detail=f'Item {item_id} not found')
