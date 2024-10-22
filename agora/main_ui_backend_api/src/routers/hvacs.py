from fastapi import APIRouter, HTTPException
from typing import List
from models.hvac import Hvac, HvacCreate
from database import get_db_connection
from psycopg2.extras import RealDictCursor

router = APIRouter()

@router.get("/hvacs", response_model=List[Hvac], tags=["hvacs"])
def list_hvacs():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM hvacs')
    hvacs = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Hvac(**hvac) for hvac in hvacs]

@router.get("/hvacs/{hvac_id}", response_model=Hvac, tags=["hvacs"])
def get_hvac(hvac_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM hvacs WHERE id = %s', (hvac_id,))
    hvac = cursor.fetchone()
    cursor.close()
    conn.close()
    if hvac is None:
        raise HTTPException(status_code=404, detail="Hvac not found")
    return Hvac(**hvac)

@router.post("/hvacs", response_model=Hvac, tags=["hvacs"])
def create_hvac(hvac: HvacCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'INSERT INTO hvacs (name, description, pressure, temperature, humidity, power, mode, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
        (hvac.name, hvac.description, hvac.pressure, hvac.temperature, hvac.humidity, hvac.power, hvac.mode, hvac.status)
    )
    new_hvac = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Hvac(**new_hvac)

@router.put("/hvacs/{hvac_id}", response_model=Hvac, tags=["hvacs"])
def update_hvac(hvac_id: int, hvac: HvacCreate):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute(
        'UPDATE hvacs SET name = %s, description = %s, pressure = %s, temperature = %s, humidity = %s, power = %s, mode = %s, status = %s WHERE id = %s RETURNING *',
        (hvac.name, hvac.description, hvac.pressure, hvac.temperature, hvac.humidity, hvac.power, hvac.mode, hvac.status, hvac_id)
    )
    updated_hvac = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if updated_hvac is None:
        raise HTTPException(status_code=404, detail="Hvac not found")
    return Hvac(**updated_hvac)

@router.delete("/hvacs/{hvac_id}", response_model=dict, tags=["hvacs"])
def delete_hvac(hvac_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM hvacs WHERE id = %s', (hvac_id,))
    conn.commit()
    cursor.close()
    conn.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Hvac not found")
    return {"message": "Hvac deleted successfully"}