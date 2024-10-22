from pydantic import BaseModel

class Hvac(BaseModel):
    id: int
    device_id: str
    temperature_celsius: float
    humidity_percent: float
    power_usage_kwh: float
    operating_mode: str

class HvacCreate(BaseModel):
    device_id: str
    temperature_celsius: float
    humidity_percent: float
    power_usage_kwh: float
    operating_mode: str