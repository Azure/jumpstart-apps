from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import random
import time
from datetime import datetime
import os

#dev mode
from dotenv import load_dotenv

import psutil
#from prometheus_client import start_http_server, Gauge, Counter

import logging
from prometheus_client import start_http_server, Gauge, Counter, Summary
from prometheus_client.exposition import generate_latest
from prometheus_client.core import CollectorRegistry
from flask import Flask, Response

#dev mode
load_dotenv()

# InfluxDB Settings
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
VERBOSE = bool(os.getenv("VERBOSE", "False"))
PORT = int(os.getenv("PORT", "8000"))

MAX_CONSECUTIVE_ERRORS = 30
consecutive_errors = 0

REGISTRY = CollectorRegistry()
CPU_USAGE = Gauge('cpu_usage_percent', 'CPU usage in percent', registry=REGISTRY)
MEMORY_USAGE = Gauge('memory_usage_percent', 'Memory usage in percent', registry=REGISTRY)
DATA_POINTS_GENERATED = Counter('data_points_generated', 'Number of data points generated', ['equipment_type'], registry=REGISTRY)
LOG_MESSAGES = Counter('log_messages', 'Number of log messages', ['level'], registry=REGISTRY)

# Refrigerator specific metrics
FRIDGE_TEMP = Gauge('refrigerator_temperature_celsius', 'Refrigerator temperature in Celsius', registry=REGISTRY)
FRIDGE_DOOR_OPEN = Gauge('refrigerator_door_open', 'Refrigerator door open status (1 for open, 0 for closed)', registry=REGISTRY)
FRIDGE_POWER_USAGE = Gauge('refrigerator_power_usage_kwh', 'Refrigerator power usage in kWh', registry=REGISTRY)

# Scale metrics
SCALE_WEIGHT = Gauge('scale_weight_kg', 'Scale weight in kg', registry=REGISTRY)
SCALE_TARE_WEIGHT = Gauge('scale_tare_weight_kg', 'Scale tare weight in kg', registry=REGISTRY)

# POS metrics
POS_ITEMS_SOLD = Counter('pos_items_sold', 'Number of items sold', registry=REGISTRY)
POS_TOTAL_AMOUNT = Counter('pos_total_amount_usd', 'Total amount of sales in USD', registry=REGISTRY)
POS_PAYMENT_METHOD = Counter('pos_payment_method', 'Payment method used', ['method'], registry=REGISTRY)

# SmartShelf metrics
SMART_SHELF_STOCK_LEVEL = Gauge('smart_shelf_stock_level', 'Smart shelf current stock level', ['product_id'], registry=REGISTRY)
SMART_SHELF_THRESHOLD = Gauge('smart_shelf_threshold', 'Smart shelf threshold stock level', ['product_id'], registry=REGISTRY)

# HVAC metrics
HVAC_TEMP = Gauge('hvac_temperature_celsius', 'HVAC temperature in Celsius', registry=REGISTRY)
HVAC_HUMIDITY = Gauge('hvac_humidity_percent', 'HVAC humidity percentage', registry=REGISTRY)
HVAC_POWER_USAGE = Gauge('hvac_power_usage_kwh', 'HVAC power usage in kWh', registry=REGISTRY)
HVAC_MODE = Gauge('hvac_mode', 'HVAC operating mode (0 for cooling, 1 for heating)', registry=REGISTRY)

# LightingSystem metrics
LIGHTING_BRIGHTNESS = Gauge('lighting_brightness_level', 'Lighting system brightness level', registry=REGISTRY)
LIGHTING_POWER_USAGE = Gauge('lighting_power_usage_kwh', 'Lighting system power usage in kWh', registry=REGISTRY)
LIGHTING_STATUS = Gauge('lighting_status', 'Lighting system status (0 for off, 1 for on)', registry=REGISTRY)

# AutomatedCheckout metrics
AUTO_CHECKOUT_ITEMS_SCANNED = Counter('auto_checkout_items_scanned', 'Number of items scanned at automated checkout', registry=REGISTRY)
AUTO_CHECKOUT_TOTAL_AMOUNT = Counter('auto_checkout_total_amount_usd', 'Total amount of sales in USD at automated checkout', registry=REGISTRY)
AUTO_CHECKOUT_PAYMENT_METHOD = Counter('auto_checkout_payment_method', 'Payment method used at automated checkout', ['method'], registry=REGISTRY)
AUTO_CHECKOUT_ERRORS = Counter('auto_checkout_errors', 'Number of errors at automated checkout', registry=REGISTRY)


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
        SCALE_WEIGHT.set(data["weight_kg"])
        SCALE_TARE_WEIGHT.set(data["tare_weight_kg"])

    elif equipment_type == "POS":
        data = {
            "transaction_id": f"txn_{random.randint(1000, 9999)}",
            "items_sold": random.randint(1, 10),
            "total_amount_usd": random.uniform(10, 500),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
        }
        POS_ITEMS_SOLD.inc(data["items_sold"])
        POS_TOTAL_AMOUNT.inc(data["total_amount_usd"])
        POS_PAYMENT_METHOD.labels(method=data["payment_method"]).inc()

    elif equipment_type == "SmartShelf":
        data = {
            "product_id": f"prod_{random.randint(1000, 9999)}",
            "stock_level": random.randint(0, 100),
            "threshold_stock_level": random.randint(10, 20),
            "last_restocked": datetime.utcnow().isoformat(),
        }
        SMART_SHELF_STOCK_LEVEL.labels(product_id=data["product_id"]).set(data["stock_level"])
        SMART_SHELF_THRESHOLD.labels(product_id=data["product_id"]).set(data["threshold_stock_level"])

    elif equipment_type == "HVAC":
        data = {
            "temperature_celsius": random.uniform(18, 24),
            "humidity_percent": random.uniform(40, 60),
            "power_usage_kwh": random.uniform(2, 4),
            "operating_mode": random.choice(["heating", "cooling"]),
        }
        HVAC_TEMP.set(data["temperature_celsius"])
        HVAC_HUMIDITY.set(data["humidity_percent"])
        HVAC_POWER_USAGE.set(data["power_usage_kwh"])
        HVAC_MODE.set(1 if data["operating_mode"] == "heating" else 0)

    elif equipment_type == "LightingSystem":
        data = {
            "brightness_level": random.uniform(0, 100),
            "power_usage_kwh": random.uniform(.05, 1.5),
            "payment_method": random.choice(["on", "off"]),
        }
        LIGHTING_BRIGHTNESS.set(data["brightness_level"])
        LIGHTING_POWER_USAGE.set(data["power_usage_kwh"])
        LIGHTING_STATUS.set(1 if data["status"] == "on" else 0)

    elif equipment_type == "AutomatedCheckout":
        data = {
            "transaction_id": f"txn_{random.randint(1000, 9999)}",
            "items_scanned": random.uniform(1, 10),
            "total_amount_usd": random.uniform(10, 500),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
            "errors": random.uniform(0, 5),
        }
        AUTO_CHECKOUT_ITEMS_SCANNED.inc(data["items_scanned"])
        AUTO_CHECKOUT_TOTAL_AMOUNT.inc(data["total_amount_usd"])
        AUTO_CHECKOUT_PAYMENT_METHOD.labels(method=data["payment_method"]).inc()
        AUTO_CHECKOUT_ERRORS.inc(data["errors"])

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
    Thread(target=lambda: app.run(host="0.0.0.0", port=PORT, use_reloader=False)).start()
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

            consecutive_errors = 0  # Reset error count on successful iteration
            time.sleep(10)
            
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            consecutive_errors += 1
            if consecutive_errors >= MAX_CONSECUTIVE_ERRORS:
                logger.critical(f"Too many consecutive errors ({MAX_CONSECUTIVE_ERRORS}). Stopping the program.")
                break
            time.sleep(10)

    logger.info("Program terminated.")
