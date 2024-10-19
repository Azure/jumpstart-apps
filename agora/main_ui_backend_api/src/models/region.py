from pydantic import BaseModel

class Region(BaseModel):
    id: int
    name: str
    description: str
    camera_id: int
    x1: int
    y1: int
    x2: int
    y2: int

class RegionCreate(BaseModel):
    name: str
    description: str
    camera_id: int
    x1: int
    y1: int
    x2: int
    y2: int