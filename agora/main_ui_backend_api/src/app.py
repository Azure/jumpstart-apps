import os
import json
import asyncio
import aiohttp
import paho.mqtt.client as mqtt
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from routers import cameras, zones, regions, hvacs

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
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "Store/Cameras/PeopleCount")
FOOTFALL_API = os.getenv("FOOTFALL_API", "http://localhost:5003/status")
SI_API = os.getenv("SI_API", "http://localhost:5001/status")

mqtt_client = mqtt.Client()

async def generate_cameras_data():
    try:
        # Call external API and get results
        message = await fetch_external_api()
        if message:
            mqtt_client.publish(MQTT_TOPIC, payload=json.dumps(message), qos=0, retain=False)
    except Exception as e:
        print(f"Error in generate_cameras_data: {e}")

async def fetch_external_api():
    async with aiohttp.ClientSession() as session:
        async with session.get(FOOTFALL_API) as response:
            return await response.json()

async def footfall_task():
    while True:
        await generate_cameras_data()
        await asyncio.sleep(20)

@app.on_event("startup")
async def startup_event():
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    asyncio.create_task(footfall_task())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
