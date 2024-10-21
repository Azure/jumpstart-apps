from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import time
import random
from datetime import datetime, timedelta

import os
import paho.mqtt.client as mqtt
import json
import concurrent.futures


import psutil
#from prometheus_client import start_http_server, Gauge, Counter

import logging
from prometheus_client import start_http_server, Gauge, Counter, Summary
from prometheus_client.exposition import generate_latest
from prometheus_client.core import CollectorRegistry
from flask import Flask, Response

#dev mode
#from dotenv import load_dotenv
#load_dotenv()


# InfluxDB Settings
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
VERBOSE = bool(os.getenv("VERBOSE", "False"))
PORT = int(os.getenv("PORT", "8000"))

# MQTT Settings
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "iot/devices")

# Device Simulation Settings
DEVICE_COUNTS = {
    "Refrigerator": int(os.getenv("REFRIGERATOR_COUNT", 2)),
    "Scale": int(os.getenv("SCALE_COUNT", 2)),
    "POS": int(os.getenv("POS_COUNT", 2)),
    "SmartShelf": int(os.getenv("SMARTSHELF_COUNT", 2)),
    "HVAC": int(os.getenv("HVAC_COUNT", 2)),
    "LightingSystem": int(os.getenv("LIGHTINGSYSTEM_COUNT", 2)),
    "AutomatedCheckout": int(os.getenv("AUTOMATEDCHECKOUT_COUNT", 2))
}

# Connect to MQTT Broker
client_id1 = f'python-mqtt-{random.randint(0, 1000)}'
#mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, client_id1)
mqtt_client = mqtt.Client()


MAX_CONSECUTIVE_ERRORS = 30
consecutive_errors = 0

REGISTRY = CollectorRegistry()
CPU_USAGE = Gauge('cpu_usage_percent', 'CPU usage in percent', registry=REGISTRY)
MEMORY_USAGE = Gauge('memory_usage_percent', 'Memory usage in percent', registry=REGISTRY)
DATA_POINTS_GENERATED = Counter('data_points_generated', 'Number of data points generated', 
                                ['equipment_type', 'device_id'], registry=REGISTRY)
LOG_MESSAGES = Counter('log_messages', 'Number of log messages', ['level'], registry=REGISTRY)

# Refrigerator specific metrics
FRIDGE_TEMP = Gauge('refrigerator_temperature_celsius', 'Refrigerator temperature in Celsius', ['device_id'], registry=REGISTRY)
FRIDGE_DOOR_OPEN = Gauge('refrigerator_door_open', 'Refrigerator door open status (1 for open, 0 for closed)', ['device_id'], registry=REGISTRY)
FRIDGE_POWER_USAGE = Gauge('refrigerator_power_usage_kwh', 'Refrigerator power usage in kWh', ['device_id'], registry=REGISTRY)

# Scale metrics
SCALE_WEIGHT = Gauge('scale_weight_kg', 'Scale weight in kg', ['device_id'], registry=REGISTRY)
SCALE_TARE_WEIGHT = Gauge('scale_tare_weight_kg', 'Scale tare weight in kg', ['device_id'], registry=REGISTRY)

# POS metrics
POS_ITEMS_SOLD = Counter('pos_items_sold', 'Number of items sold', ['device_id'], registry=REGISTRY)
POS_TOTAL_AMOUNT = Counter('pos_total_amount_usd', 'Total amount of sales in USD', ['device_id'], registry=REGISTRY)
POS_PAYMENT_METHOD = Counter('pos_payment_method', 'Payment method used', ['method', 'device_id'], registry=REGISTRY)

# SmartShelf metrics
SMART_SHELF_STOCK_LEVEL = Gauge('smart_shelf_stock_level', 'Smart shelf current stock level', ['product_id', 'device_id'], registry=REGISTRY)
SMART_SHELF_THRESHOLD = Gauge('smart_shelf_threshold', 'Smart shelf threshold stock level', ['product_id', 'device_id'], registry=REGISTRY)

# HVAC metrics
HVAC_TEMP = Gauge('hvac_temperature_celsius', 'HVAC temperature in Celsius', ['device_id'], registry=REGISTRY)
HVAC_HUMIDITY = Gauge('hvac_humidity_percent', 'HVAC humidity percentage', ['device_id'], registry=REGISTRY)
HVAC_POWER_USAGE = Gauge('hvac_power_usage_kwh', 'HVAC power usage in kWh', ['device_id'], registry=REGISTRY)
HVAC_MODE = Gauge('hvac_mode', 'HVAC operating mode (0 for cooling, 1 for heating)', ['device_id'], registry=REGISTRY)

# LightingSystem metrics
LIGHTING_BRIGHTNESS = Gauge('lighting_brightness_level', 'Lighting system brightness level', ['device_id'], registry=REGISTRY)
LIGHTING_POWER_USAGE = Gauge('lighting_power_usage_kwh', 'Lighting system power usage in kWh', ['device_id'], registry=REGISTRY)
LIGHTING_STATUS = Gauge('lighting_status', 'Lighting system status (0 for off, 1 for on)', ['device_id'], registry=REGISTRY)

# AutomatedCheckout metrics
AUTO_CHECKOUT_ITEMS_SCANNED = Counter('auto_checkout_items_scanned', 'Number of items scanned at automated checkout', ['device_id'], registry=REGISTRY)
AUTO_CHECKOUT_TOTAL_AMOUNT = Counter('auto_checkout_total_amount_usd', 'Total amount of sales in USD at automated checkout', ['device_id'], registry=REGISTRY)
AUTO_CHECKOUT_PAYMENT_METHOD = Counter('auto_checkout_payment_method', 'Payment method used at automated checkout', ['method', 'device_id'], registry=REGISTRY)
AUTO_CHECKOUT_ERRORS = Counter('auto_checkout_errors', 'Number of errors at automated checkout', ['device_id'], registry=REGISTRY)

EQUIPMENT_TYPES = ["Refrigerator", "Scale", "POS", "SmartShelf", "HVAC", "LightingSystem", "AutomatedCheckout"]


# Function to increment the data points counter
def increment_data_points(equipment_type, device_id):
    DATA_POINTS_GENERATED.labels(equipment_type=equipment_type, device_id=device_id).inc()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom logging handler to count log messages
class PrometheusLogHandler(logging.Handler):
    def emit(self, record):
        LOG_MESSAGES.labels(level=record.levelname).inc()

logger.addHandler(PrometheusLogHandler())

# Flask app for metrics endpoint
app = Flask(__name__)

@app.route('/metrics')
def metrics():
    return Response(generate_latest(REGISTRY), mimetype="text/plain")


# Connect to InfluxDB
client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

def generate_equipment_data(equipment_type, device_id):
    data = {"device_id": device_id}
    
    if equipment_type == "Refrigerator":
        data.update({
            "temperature_celsius": round(random.uniform(1, 5), 2),
            "door_open": random.choice([True, False]),
            "power_usage_kwh": round(random.uniform(1.5, 3.5), 2),
        })
    
    elif equipment_type == "Scale":
        data.update({
            "weight_kg": round(random.uniform(0.5, 20), 2),
            "tare_weight_kg": round(random.uniform(0.05, 0.5), 2),
        })
    
    elif equipment_type == "POS":
        data.update({
            "transaction_id": f"txn_{random.randint(1000, 9999)}",
            "items_sold": float(random.randint(1, 10)),  # Convert to float
            "total_amount_usd": round(random.uniform(10, 500), 2),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
        })
    
    elif equipment_type == "SmartShelf":
        data.update({
            "product_id": f"prod_{random.randint(1000, 9999)}",
            "stock_level": float(random.randint(0, 100)),  # Convert to float
            "threshold_stock_level": float(random.randint(10, 20)),  # Convert to float
            "last_restocked": (datetime.utcnow() - timedelta(hours=random.randint(0, 48))).isoformat(),
        })
    
    elif equipment_type == "HVAC":
        data.update({
            "temperature_celsius": round(random.uniform(18, 24), 2),
            "humidity_percent": round(random.uniform(40, 60), 2),
            "power_usage_kwh": round(random.uniform(2, 4), 2),
            "operating_mode": random.choice(["heating", "cooling"]),
        })
    
    elif equipment_type == "LightingSystem":
        data.update({
            "brightness_level": round(random.uniform(0, 100), 2),
            "power_usage_kwh": round(random.uniform(0.05, 1.5), 2),
            "status": random.choice(["on", "off"]),
        })
    
    elif equipment_type == "AutomatedCheckout":
        data.update({
            "transaction_id": f"txn_{random.randint(1000, 9999)}",
            "items_scanned": float(random.randint(1, 10)),  # Convert to float
            "total_amount_usd": round(random.uniform(10, 500), 2),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
            "errors": float(random.randint(0, 5)),  # Convert to float
        })
    
    else:
        # Default case for unknown equipment types
        data.update({
            "status": random.choice(["active", "inactive", "maintenance"]),
            "last_maintenance": (datetime.utcnow() - timedelta(days=random.randint(0, 30))).isoformat(),
        })
    
    return data

def write_data_to_influxdb(equipment_type, device_id, measurement_name, timestamp, data):
    try:
        point = Point(measurement_name).time(timestamp, WritePrecision.NS)
        #for key, value in data.items():
        #    point.field(key, value)
        point = Point(measurement_name).time(timestamp, WritePrecision.NS)
        for key, value in data.items():
            if isinstance(value, (int, float)):
                point.field(key, float(value))  # Ensure all numbers are float
            elif isinstance(value, bool):
                point.field(key, value)
            elif isinstance(value, str):
                point.tag(key, value)  # Use strings as tags instead of fields
            else:
                logger.warning(f"Skipping field {key} with unsupported type {type(value)}")
                
        write_api.write(bucket=INFLUXDB_BUCKET, record=point)

        if VERBOSE:
            logger.info(f"Data for {device_id} written to InfluxDB: {data}")
    
        # Increment Prometheus counter for data points generated
        #DATA_POINTS_GENERATED.labels(equipment_type=equipment_type, device_id=device_id).inc()
    except Exception as e:
        logger.error(f"Error writing data to InfluxDB for {device_id}: {str(e)}")


def publish_data_to_mqtt(equipment_type, device_id, timestamp, data):
    try:
        mqtt_payload = json.dumps({
            "timestamp": timestamp,
            "device_id": device_id,
            "equipment_type": equipment_type,
            "data": data
        })
        mqtt_client.publish(f"{MQTT_TOPIC}/{equipment_type}/{device_id}", mqtt_payload)

        if VERBOSE:
            logger.info(f"Data for {device_id} published to MQTT: {mqtt_payload}")
    except Exception as e:
        logger.error(f"Error publishing data to MQTT for {device_id}: {str(e)}")


def update_system_metrics():
    while True:
        try:
            CPU_USAGE.set(psutil.cpu_percent())
            MEMORY_USAGE.set(psutil.virtual_memory().percent)
            time.sleep(5)  # Update system metrics every 5 seconds
        except Exception as e:
            logger.error(f"Error updating system metrics: {str(e)}")
            time.sleep(5)  # Wait a bit before retrying

def update_prometheus_metrics(equipment_type, device_id, data):
    try:
        if equipment_type == "Refrigerator":
            FRIDGE_TEMP.labels(device_id=device_id).set(data["temperature_celsius"])
            FRIDGE_DOOR_OPEN.labels(device_id=device_id).set(1 if data["door_open"] else 0)
            FRIDGE_POWER_USAGE.labels(device_id=device_id).set(data["power_usage_kwh"])
        elif equipment_type == "Scale":
            SCALE_WEIGHT.labels(device_id=device_id).set(data["weight_kg"])
            SCALE_TARE_WEIGHT.labels(device_id=device_id).set(data["tare_weight_kg"])
        elif equipment_type == "POS":
            POS_ITEMS_SOLD.labels(device_id=device_id).inc(data["items_sold"])
            POS_TOTAL_AMOUNT.labels(device_id=device_id).inc(data["total_amount_usd"])
            POS_PAYMENT_METHOD.labels(method=data["payment_method"], device_id=device_id).inc()
        elif equipment_type == "SmartShelf":
            SMART_SHELF_STOCK_LEVEL.labels(product_id=data["product_id"], device_id=device_id).set(data["stock_level"])
            SMART_SHELF_THRESHOLD.labels(product_id=data["product_id"], device_id=device_id).set(data["threshold_stock_level"])
        elif equipment_type == "HVAC":
            HVAC_TEMP.labels(device_id=device_id).set(data["temperature_celsius"])
            HVAC_HUMIDITY.labels(device_id=device_id).set(data["humidity_percent"])
            HVAC_POWER_USAGE.labels(device_id=device_id).set(data["power_usage_kwh"])
            HVAC_MODE.labels(device_id=device_id).set(1 if data["operating_mode"] == "heating" else 0)
        elif equipment_type == "LightingSystem":
            LIGHTING_BRIGHTNESS.labels(device_id=device_id).set(data["brightness_level"])
            LIGHTING_POWER_USAGE.labels(device_id=device_id).set(data["power_usage_kwh"])
            LIGHTING_STATUS.labels(device_id=device_id).set(1 if data["status"] == "on" else 0)
        elif equipment_type == "AutomatedCheckout":
            AUTO_CHECKOUT_ITEMS_SCANNED.labels(device_id=device_id).inc(data["items_scanned"])
            AUTO_CHECKOUT_TOTAL_AMOUNT.labels(device_id=device_id).inc(data["total_amount_usd"])
            AUTO_CHECKOUT_PAYMENT_METHOD.labels(method=data["payment_method"], device_id=device_id).inc()
            AUTO_CHECKOUT_ERRORS.labels(device_id=device_id).inc(data["errors"])
        
        DATA_POINTS_GENERATED.labels(equipment_type=equipment_type, device_id=device_id).inc()
    except KeyError as e:
        logger.error(f"Error updating Prometheus metrics for {device_id}: Missing key {str(e)}")
        LOG_MESSAGES.labels(level="error").inc()
    except Exception as e:
        logger.error(f"Error updating Prometheus metrics for {device_id}: {str(e)}")
        LOG_MESSAGES.labels(level="error").inc()


def simulate_device(equipment_type, device_id):
    while True:
        try:
            timestamp = datetime.utcnow().isoformat()
            data = generate_equipment_data(equipment_type, device_id)

            measurement_name = f"{device_id}_{equipment_type.lower()}_data"
            
            # Write to InfluxDB
            write_data_to_influxdb(equipment_type, device_id, measurement_name, timestamp, data)
            
            # Publish to MQTT
            publish_data_to_mqtt(equipment_type, device_id, timestamp, data)

            # Update Prometheus metrics
            update_prometheus_metrics(equipment_type, device_id, data)

            # Increment the data points counter
            increment_data_points(equipment_type, device_id)
            
            time.sleep(random.uniform(8, 12))  # Random sleep between 8 and 12 seconds
        except Exception as e:
            logger.error(f"Error in {device_id} simulation: {str(e)}")
            time.sleep(5)  # Wait a bit before retrying

if __name__ == "__main__":
    
    from threading import Thread
    Thread(target=lambda: app.run(host="0.0.0.0", port=PORT, use_reloader=False)).start()
    logger.info("Metrics available at http://localhost:{0}}/metrics",PORT)

    # Start system metrics update in a separate thread
    Thread(target=update_system_metrics, daemon=True).start()
    logger.info("System metrics update thread started")

    try:
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
        mqtt_client.loop_start()
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")


    # Create a list of all devices to simulate
    devices_to_simulate = []
    for equipment_type, count in DEVICE_COUNTS.items():
        for i in range(count):
            device_id = f"{equipment_type}{i+1:02d}"
            devices_to_simulate.append((equipment_type, device_id))
    
    logger.info(f"Preparing to simulate {len(devices_to_simulate)} devices")

    # Use a ThreadPoolExecutor to run device simulations in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(devices_to_simulate)) as executor:
        # Submit a task for each device
        futures = [executor.submit(simulate_device, equipment_type, device_id) 
                   for equipment_type, device_id in devices_to_simulate]
        
        logger.info("All device simulation threads started")
        
        try:
            # Wait for all tasks to complete (which they never will in this case)
            concurrent.futures.wait(futures)
        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received. Shutting down...")
        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}")
        finally:
            logger.info("Shutting down MQTT client...")
            mqtt_client.loop_stop()
            mqtt_client.disconnect()
            
            logger.info("Shutting down InfluxDB client...")
            client.close()
            
            logger.info("Program terminated.")
