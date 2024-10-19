from pydantic import BaseModel

class Camera(BaseModel):
    id: int
    name: str
    description: str
    rtspuri: str

class CameraCreate(BaseModel):
    name: str
    description: str
    rtspuri: str