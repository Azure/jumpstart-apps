from fastapi import APIRouter, HTTPException
from typing import List, Optional
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
@router.put("/hvacs/{hvac_id}", response_model=Hvac, tags=["hvacs"])
def upsert_hvac(hvac: HvacCreate, hvac_id: Optional[int] = None):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    if hvac_id:
        cursor.execute(
            'INSERT INTO hvacs (id, name, description, pressure, temperature, humidity, power, mode, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) '
            'ON CONFLICT (id) DO UPDATE SET '
            'name = EXCLUDED.name, description = EXCLUDED.description, pressure = EXCLUDED.pressure, '
            'temperature = EXCLUDED.temperature, humidity = EXCLUDED.humidity, power = EXCLUDED.power, '
            'mode = EXCLUDED.mode, status = EXCLUDED.status RETURNING *',
            (hvac_id, hvac.name, hvac.description, hvac.pressure, hvac.temperature, hvac.humidity, hvac.power, hvac.mode, hvac.status)
        )
    else:
        cursor.execute(
            'INSERT INTO hvacs (name, description, pressure, temperature, humidity, power, mode, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *',
            (hvac.name, hvac.description, hvac.pressure, hvac.temperature, hvac.humidity, hvac.power, hvac.mode, hvac.status)
        )
    new_hvac = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return Hvac(**new_hvac)

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