from pydantic import BaseModel, Field, RootModel


class CityData(BaseModel):
    locations: list[str] = Field(default_factory=list)

class TownsAndLocations(RootModel):
    """
    Structure:
    [                                      <- The Batch (List of Lines)
       [                                   <- Line 1 Data (List of Towns)
          {"Parzew": {"locations": [...]}},
          {"Sławoszew": {"locations": [...]}}
       ],
       [                                   <- Line 2 Data
          {"Lubinia": {"locations": [...]}}
       ]
    ]
    """
    root: list[list[dict[str, CityData]]]
