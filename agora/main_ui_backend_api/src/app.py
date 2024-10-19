import os
from fastapi import FastAPI, HTTPException
from typing import List
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI()

# Pydantic model for Camera
class Camera(BaseModel):
    id: int
    name: str
    description: str
    rtspuri: str

class CameraCreate(BaseModel):
    name: str
    description: str
    rtspuri: str

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

# Database connection function
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DATABASE_HOST', 'mssql-service'),
        dbname=os.getenv('DATABASE_NAME', 'contoso'),
        user=os.getenv('DATABASE_USER', 'postgres'),
        password=os.getenv('DATABASE_PASSWORD', 'password')
    )
    return conn

# Cameras endpoints
@app.get("/cameras", response_model=List[Camera])
def list_cameras():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM cameras')
    cameras = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Camera(**camera) for camera in cameras]

@app.get("/cameras/{camera_id}", response_model=Camera)
def get_camera(camera_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM cameras WHERE id = %s', (camera_id,))
    camera = cursor.fetchone()
    cursor.close()
    conn.close()
    if camera is None:
        raise HTTPException(status_code=404, detail="Camera not found")
    return Camera(**camera)

@app.post("/cameras", response_model=Camera)
def create_camera(camera: CameraCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'INSERT INTO cameras (name, description, rtspuri) VALUES (%s, %s, %s) RETURNING *',
        (camera.name, camera.description, camera.rtspuri)
    )
    new_camera = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Camera(**new_camera)

@app.put("/cameras/{camera_id}", response_model=Camera)
def update_camera(camera_id: int, camera: CameraCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE cameras SET name = ?, description = ?, rtspuri = ? WHERE id = ?', 
                   (camera.name, camera.description, camera.rtspuri, camera_id))
    conn.commit()
    conn.close()
    return Camera(id=camera_id, name=camera.name, description=camera.description, rtspuri=camera.rtspuri)

@app.delete("/cameras/{camera_id}", response_model=dict)
def delete_camera(camera_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM cameras WHERE id = ?', (camera_id,))
    conn.commit()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"message": "Camera deleted successfully"}

# Zones endpoints
@app.get("/zones", response_model=List[Zone])
def list_zones():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM zones')
    zones = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Zone(**zone) for zone in zones]

@app.get("/zones/{zone_id}", response_model=Zone)
def get_zone(zone_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM zones WHERE id = %s', (zone_id,))
    zone = cursor.fetchone()
    cursor.close()
    conn.close()
    if zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return Zone(**zone)

@app.post("/zones", response_model=Zone)
def create_zone(zone: ZoneCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'INSERT INTO zones (name, description, x1, y1, x2, y2) VALUES (%s, %s, %s, %s, %s, %s) RETURNING *',
        (zone.name, zone.description, zone.x1, zone.y1, zone.x2, zone.y2)
    )
    new_zone = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Zone(**new_zone)

@app.put("/zones/{zone_id}", response_model=Zone)
def update_zone(zone_id: int, zone: ZoneCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'UPDATE zones SET name = %s, description = %s, x1 = %s, y1 = %s, x2 = %s, y2 = %s WHERE id = %s RETURNING *',
        (zone.name, zone.description, zone.x1, zone.y1, zone.x2, zone.y2, zone_id)
    )
    updated_zone = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if updated_zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return Zone(**updated_zone)

@app.delete("/zones/{zone_id}", response_model=dict)
def delete_zone(zone_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM zones WHERE id = %s', (zone_id,))
    conn.commit()
    cursor.close()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": "Zone deleted successfully"}

# Regions endpoints
@app.get("/regions", response_model=List[Region])
def list_regions():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM regions')
    regions = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Region(**region) for region in regions]

@app.get("/regions/{region_id}", response_model=Region)
def get_region(region_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM regions WHERE id = %s', (region_id,))
    region = cursor.fetchone()
    cursor.close()
    conn.close()
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return Region(**region)

@app.post("/regions", response_model=Region)
def create_region(region: RegionCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'INSERT INTO regions (name, description, camera_id, x1, y1, x2, y2) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *',
        (region.name, region.description, region.camera_id, region.x1, region.y1, region.x2, region.y2)
    )
    new_region = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Region(**new_region)

@app.put("/regions/{region_id}", response_model=Region)
def update_region(region_id: int, region: RegionCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'UPDATE regions SET name = %s, description = %s, camera_id = %s, x1 = %s, y1 = %s, x2 = %s, y2 = %s WHERE id = %s RETURNING *',
        (region.name, region.description, region.camera_id, region.x1, region.y1, region.x2, region.y2, region_id)
    )
    updated_region = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if updated_region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return Region(**updated_region)

@app.delete("/regions/{region_id}", response_model=dict)
def delete_region(region_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM regions WHERE id = %s', (region_id,))
    conn.commit()
    cursor.close()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Region not found")
    return {"message": "Region deleted successfully"}

# Ovens endpoints
@app.get("/ovens", response_model=List[Oven])
def list_ovens():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM ovens')
    ovens = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Oven(**oven) for oven in ovens]

@app.get("/ovens/{oven_id}", response_model=Oven)
def get_oven(oven_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM ovens WHERE id = %s', (oven_id,))
    oven = cursor.fetchone()
    cursor.close()
    conn.close()
    if oven is None:
        raise HTTPException(status_code=404, detail="Oven not found")
    return Oven(**oven)

@app.post("/ovens", response_model=Oven)
def create_oven(oven: OvenCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'INSERT INTO ovens (name, description, pressure, temperature, humidity, power, mode, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
        (oven.name, oven.description, oven.pressure, oven.temperature, oven.humidity, oven.power, oven.mode, oven.status)
    )
    new_oven = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Oven(**new_oven)

@app.put("/ovens/{oven_id}", response_model=Oven)
def update_oven(oven_id: int, oven: OvenCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'UPDATE ovens SET name = %s, description = %s, pressure = %s, temperature = %s, humidity = %s, power = %s, mode = %s, status = %s WHERE id = %s RETURNING *',
        (oven.name, oven.description, oven.pressure, oven.temperature, oven.humidity, oven.power, oven.mode, oven.status, oven_id)
    )
    updated_oven = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if updated_oven is None:
        raise HTTPException(status_code=404, detail="Oven not found")
    return Oven(**updated_oven)

@app.delete("/ovens/{oven_id}", response_model=dict)
def delete_oven(oven_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM ovens WHERE id = %s', (oven_id,))
    conn.commit()
    cursor.close()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Oven not found")
    return {"message": "Oven deleted successfully"}

# Fridges endpoints
@app.get("/fridges", response_model=List[Fridge])
def list_fridges():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM fridges')
    fridges = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Fridge(**fridge) for fridge in fridges]

@app.get("/fridges/{fridge_id}", response_model=Fridge)
def get_fridge(fridge_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM fridges WHERE id = %s', (fridge_id,))
    fridge = cursor.fetchone()
    cursor.close()
    conn.close()
    if fridge is None:
        raise HTTPException(status_code=404, detail="Fridge not found")
    return Fridge(**fridge)

@app.post("/fridges", response_model=Fridge)
def create_fridge(fridge: FridgeCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'INSERT INTO fridges (name, description, temperature, humidity, power, mode, status) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *',
        (fridge.name, fridge.description, fridge.temperature, fridge.humidity, fridge.power, fridge.mode, fridge.status)
    )
    new_fridge = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Fridge(**new_fridge)

@app.put("/fridges/{fridge_id}", response_model=Fridge)
def update_fridge(fridge_id: int, fridge: FridgeCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'UPDATE fridges SET name = %s, description = %s, temperature = %s, humidity = %s, power = %s, mode = %s, status = %s WHERE id = %s RETURNING *',
        (fridge.name, fridge.description, fridge.temperature, fridge.humidity, fridge.power, fridge.mode, fridge.status, fridge_id)
    )
    updated_fridge = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if updated_fridge is None:
        raise HTTPException(status_code=404, detail="Fridge not found")
    return Fridge(**updated_fridge)

@app.delete("/fridges/{fridge_id}", response_model=dict)
def delete_fridge(fridge_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM fridges WHERE id = %s', (fridge_id,))
    conn.commit()
    cursor.close()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Fridge not found")
    return {"message": "Fridge deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
