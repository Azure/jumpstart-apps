from pydantic import BaseModel

class Zone(BaseModel):
    id: int
    name: str
    description: str
    x1: int
    y1: int
    x2: int
    y2: int

class ZoneCreate(BaseModel):
    name: str
    description: str
    x1: int
    y1: int
    x2: int
    y2: int