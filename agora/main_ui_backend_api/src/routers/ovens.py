from fastapi import APIRouter, HTTPException
from typing import List
from models.oven import Oven, OvenCreate
from database import get_db_connection
from psycopg2.extras import RealDictCursor

router = APIRouter()

@router.get("/ovens", response_model=List[Oven], tags=["ovens"])
def list_ovens():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM ovens')
    ovens = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Oven(**oven) for oven in ovens]

@router.get("/ovens/{oven_id}", response_model=Oven, tags=["ovens"])
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

@router.post("/ovens", response_model=Oven, tags=["ovens"])
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

@router.put("/ovens/{oven_id}", response_model=Oven, tags=["ovens"])
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

@router.delete("/ovens/{oven_id}", response_model=dict, tags=["ovens"])
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