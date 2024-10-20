from fastapi import APIRouter, HTTPException
from typing import List
from models.region import Region, RegionCreate
from database import get_db_connection
from psycopg2.extras import RealDictCursor

router = APIRouter()

@router.get("/regions", response_model=List[Region], tags=["regions"])
def list_regions():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM regions')
    regions = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Region(**region) for region in regions]

@router.get("/regions/{region_id}", response_model=Region, tags=["regions"])
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

@router.post("/regions", response_model=Region, tags=["regions"])
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

@router.put("/regions/{region_id}", response_model=Region, tags=["regions"])
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

@router.delete("/regions/{region_id}", response_model=dict, tags=["regions"])
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