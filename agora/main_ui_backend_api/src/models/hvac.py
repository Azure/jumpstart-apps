from pydantic import BaseModel

class Hvac(BaseModel):
    id: int
    name: str
    description: str
    pressure: int
    temperature: int
    humidity: int
    power: int
    mode: str
    status: str

class HvacCreate(BaseModel):
    name: str
    description: str
    pressure: int
    temperature: int
    humidity: int
    power: int
    mode: str
    status: str