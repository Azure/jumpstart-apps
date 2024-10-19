from fastapi import APIRouter, HTTPException
from typing import List
from models.camera import Camera, CameraCreate
from database import get_db_connection
from psycopg2.extras import RealDictCursor

router = APIRouter()

@router.get("/cameras", response_model=List[Camera], tags=["cameras"])
def list_cameras():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM cameras')
    cameras = cursor.fetchall()
    cursor.close()
    conn.close()
    return [Camera(**camera) for camera in cameras]

@router.get("/cameras/{camera_id}", response_model=Camera, tags=["cameras"])
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

@router.post("/cameras", response_model=Camera, tags=["cameras"])
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