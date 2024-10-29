from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from routers import cameras, zones, regions, hvacs
import paho.mqtt.client as mqtt
import requests
import time
from database import get_db_connection
from models.camera import Camera
from psycopg2.extras import RealDictCursor
import asyncio
import os
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(cameras.router)
app.include_router(zones.router)
app.include_router(regions.router)
app.include_router(hvacs.router)

MQTT_BROKER = os.getenv("MQTT_BROKER", "test.mosquitto.org")
MQTT_PORT = os.getenv("MQTT_PORT", 1883)
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "Store/Cameras/PeopleCount")
FOOTFALL_API = os.getenv("FOOTFALL_API", "http://footfall-api:5003/status")
SI_API = os.getenv("SI_API", "http://shopper-experience-api:5001/status")

async def generate_cameras_data():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT * FROM cameras')
    cameras = cursor.fetchall()
    cursor.close()
    conn.close()
    cameras =  [Camera(**camera) for camera in cameras]

    # Call external API and get results
    message = await fetch_external_api(cameras[0].id)

    # For each result generate MQ message
    if (bool(message)):
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.publish(MQTT_TOPIC, payload=json.dumps(message), qos=0, retain=False)

async def fetch_external_api(camera_id):
    response = requests.get(f"{FOOTFALL_API}")
    #response = requests.get(f"{SI_API}")
    return response.json()

async def footfall_task():
    while True:
        await generate_cameras_data()
        await asyncio.sleep(20)

async def shopper_insights_task():
    while True:
        await generate_cameras_data()
        await asyncio.sleep(20)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(footfall_task())
    #asyncio.create_task(shopper_insights_task())

if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(app, host="0.0.0.0", port=5002)
    finally:
        client.disconnect()