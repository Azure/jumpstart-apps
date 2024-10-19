from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import random
import time
from datetime import datetime
import os
#from dotenv import load_dotenv

import psutil
#from prometheus_client import start_http_server, Gauge, Counter

import logging
from prometheus_client import start_http_server, Gauge, Counter, Summary
from prometheus_client.exposition import generate_latest
from prometheus_client.core import CollectorRegistry
from flask import Flask, Response

#development
#load_dotenv()

# InfluxDB Settings
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
VERBOSE = bool(os.getenv("VERBOSE", "False"))
PORT = int(os.getenv("PORT", "8000"))

REGISTRY = CollectorRegistry()
CPU_USAGE = Gauge('cpu_usage_percent', 'CPU usage in percent', registry=REGISTRY)
MEMORY_USAGE = Gauge('memory_usage_percent', 'Memory usage in percent', registry=REGISTRY)
DATA_POINTS_GENERATED = Counter('data_points_generated', 'Number of data points generated', ['equipment_type'], registry=REGISTRY)
LOG_MESSAGES = Counter('log_messages', 'Number of log messages', ['level'], registry=REGISTRY)

# Refrigerator specific metrics
FRIDGE_TEMP = Gauge('refrigerator_temperature_celsius', 'Refrigerator temperature in Celsius', registry=REGISTRY)
FRIDGE_DOOR_OPEN = Gauge('refrigerator_door_open', 'Refrigerator door open status (1 for open, 0 for closed)', registry=REGISTRY)
FRIDGE_POWER_USAGE = Gauge('refrigerator_power_usage_kwh', 'Refrigerator power usage in kWh', registry=REGISTRY)


# Initialize Prometheus metrics for each equipment type
equipment_types = ["Refrigerator", "Scale", "POS", "SmartShelf", "HVAC", "LightingSystem", "AutomatedCheckout"]
for equipment in equipment_types:
    DATA_POINTS_GENERATED.labels(equipment_type=equipment)

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

def generate_equipment_data(equipment_type):
    if equipment_type == "Refrigerator":
        data = {
            "temperature_celsius": random.uniform(1, 5),
            "door_open": random.choice([True, False]),
            "power_usage_kwh": random.uniform(1.5, 3.5),
        }
        # Update Prometheus metrics for refrigerator
        FRIDGE_TEMP.set(data["temperature_celsius"])
        FRIDGE_DOOR_OPEN.set(1 if data["door_open"] else 0)
        FRIDGE_POWER_USAGE.set(data["power_usage_kwh"])

    elif equipment_type == "Scale":
        data = {
            "weight_kg": random.uniform(0.5, 20),
            "tare_weight_kg": random.uniform(0.05, 0.5),
        }
    elif equipment_type == "POS":
        data = {
            "transaction_id": f"txn_{random.randint(1000, 9999)}",
            "items_sold": random.randint(1, 10),
            "total_amount_usd": random.uniform(10, 500),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
        }
    elif equipment_type == "SmartShelf":
        data = {
            "product_id": f"prod_{random.randint(1000, 9999)}",
            "stock_level": random.randint(0, 100),
            "threshold_stock_level": random.randint(10, 20),
            "last_restocked": datetime.utcnow().isoformat(),
        }
    elif equipment_type == "HVAC":
        data = {
            "temperature_celsius": random.uniform(18, 24),
            "humidity_percent": random.uniform(40, 60),
            "power_usage_kwh": random.uniform(2, 4),
            "operating_mode": random.choice(["heating", "cooling"]),
        }
    elif equipment_type == "LightingSystem":
        data = {
            "brightness_level": random.uniform(0, 100),
            "power_usage_kwh": random.uniform(.05, 1.5),
            "payment_method": random.choice(["on", "off"]),
        }
    elif equipment_type == "AutomatedCheckout":
        data = {
            "transaction_id": f"txn_{random.randint(1000, 9999)}",
            "items_scanned": random.uniform(1, 10),
            "total_amount_usd": random.uniform(10, 500),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
            "errors": random.uniform(0, 5),
        }
    else:
        # General data for other equipment types (could be extended as needed)
        data = {
            "current": random.uniform(0, 0.1),
            "voltage": random.uniform(100, 220),
            "status": random.choice(["running", "stopped"]),
        }
    
    return data

def write_data_to_influxdb(equipment_type, measurement_name, timestamp):
    data = generate_equipment_data(equipment_type)
    point = Point(measurement_name).time(timestamp, WritePrecision.NS)
    
    for key, value in data.items():
        point.field(key, value)

    write_api.write(bucket=INFLUXDB_BUCKET, record=point)
    if VERBOSE:
        print(f"Written {equipment_type} data to InfluxDB: {data}")
        logger.info(f"Written {equipment_type} data to InfluxDB: {data}")

    # Increment Prometheus counter for data points generated
    DATA_POINTS_GENERATED.labels(equipment_type=equipment_type).inc()

def update_system_metrics():
    CPU_USAGE.set(psutil.cpu_percent())
    MEMORY_USAGE.set(psutil.virtual_memory().percent)

if __name__ == "__main__":
    #start_http_server(8011)
    #print("Prometheus metrics available on port 8011")

    from threading import Thread
    Thread(target=lambda: app.run(port=PORT, use_reloader=False)).start()
    logger.info("Metrics available at http://localhost:{0}}/metrics",PORT)

    while True:
        try:
            timestamp = datetime.utcnow().isoformat()
            # Write data for different types of equipment
            write_data_to_influxdb("Refrigerator", "refrigerator_data", timestamp)
            write_data_to_influxdb("Scale", "scale_data", timestamp)
            write_data_to_influxdb("POS", "pos_data", timestamp)
            write_data_to_influxdb("SmartShelf", "smart_shelf_data", timestamp)
            write_data_to_influxdb("HVAC", "hvac_data", timestamp)
            write_data_to_influxdb("LightingSystem", "lighting_system_data", timestamp)
            write_data_to_influxdb("AutomatedCheckout", "automated_checkout_data", timestamp)

            #Update system metrics
            update_system_metrics()
            
            time.sleep(5)
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
        