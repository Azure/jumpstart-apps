from pydantic import BaseModel

class Oven(BaseModel):
    id: int
    name: str
    description: str
    pressure: int
    temperature: int
    humidity: int
    power: int
    mode: str
    status: str

class OvenCreate(BaseModel):
    name: str
    description: str
    pressure: int
    temperature: int
    humidity: int
    power: int
    mode: str
    status: str