from fastapi import APIRouter, HTTPException
from typing import List
from models.fridge import Fridge, FridgeCreate
from database import get_db_connection
from psycopg2.extras import RealDictCursor

router = APIRouter()

@router.get("/fridges", response_model=List[Fridge], tags=["fridges"])
def list_fridges():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM fridges')
    fridges = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Fridge(**fridge) for fridge in fridges]

@router.get("/fridges/{fridge_id}", response_model=Fridge, tags=["fridges"])
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

@router.post("/fridges", response_model=Fridge, tags=["fridges"])
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

@router.put("/fridges/{fridge_id}", response_model=Fridge, tags=["fridges"])
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

@router.delete("/fridges/{fridge_id}", response_model=dict, tags=["fridges"])
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