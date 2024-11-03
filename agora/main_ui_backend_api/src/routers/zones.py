from fastapi import APIRouter, HTTPException
from typing import List
from models.zone import Zone, ZoneCreate
from database import get_db_connection
from psycopg2.extras import RealDictCursor

router = APIRouter()

@router.get("/zones", response_model=List[Zone], tags=["zones"])
def list_zones():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM zones')
    zones = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Zone(**zone) for zone in zones]

@router.get("/zones/{zone_id}", response_model=Zone, tags=["zones"])
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

@router.post("/zones", response_model=Zone, tags=["zones"])
def create_zone(zone: ZoneCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'INSERT INTO zones (name, description, x1, y1, x2, y2, camera_id) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *',
        (zone.name, zone.description, zone.x1, zone.y1, zone.x2, zone.y2, zone.camera_id)
    )
    new_zone = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Zone(**new_zone)

@router.put("/zones/{zone_id}", response_model=Zone, tags=["zones"])
def update_zone(zone_id: int, zone: ZoneCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'UPDATE zones SET name = %s, description = %s, x1 = %s, y1 = %s, x2 = %s, y2 = %s, camera_id = %s WHERE id = %s RETURNING *',
        (zone.name, zone.description, zone.x1, zone.y1, zone.x2, zone.y2, zone.camera_id, zone_id)
    )
    updated_zone = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if updated_zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return Zone(**updated_zone)

@router.delete("/zones/{zone_id}", response_model=dict, tags=["zones"])
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