from pydantic import BaseModel, Field, RootModel


class TownsAndLocations(RootModel):
    """
    Structure:
    [                                      <- The Batch (List of Lines)
       {                                   <- Line 1 Data (List of Towns)
          "Parzew": [...],
          "Sławoszew": [...]
       },
       {                                   <- Line 2 Data
          "Lubinia": [...]
       }
    ]
    """
    root: list[dict[str, list[str]]]
