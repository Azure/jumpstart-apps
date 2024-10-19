from pydantic import BaseModel

class Fridge(BaseModel):
    id: int
    name: str
    description: str
    temperature: int
    humidity: int
    power: int
    mode: str
    status: str

class FridgeCreate(BaseModel):
    name: str
    description: str
    temperature: int
    humidity: int
    power: int
    mode: str
    status: str