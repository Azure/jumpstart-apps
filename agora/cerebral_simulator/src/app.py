from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import time
import random
from datetime import datetime, timedelta
import requests

import os
import paho.mqtt.client as mqtt
import json
import concurrent.futures

import psutil
from prometheus_client import start_http_server, Gauge, Counter, Summary
from prometheus_client.exposition import generate_latest
from prometheus_client.core import CollectorRegistry
from flask import Flask, Response, jsonify
from flasgger import Swagger, swag_from

from store_simulator import run_store_simulator

#dev mode
#from dotenv import load_dotenv
#load_dotenv()

# InfluxDB Settings
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
VERBOSE = bool(os.getenv("VERBOSE", "False"))
PORT = int(os.getenv("PORT", "8001"))
UI_API_URL = os.getenv("UI_API_URL", "http://0.0.0.0:5002")

# MQTT Settings
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "iot/devices")

ENABLE_MQTT = os.getenv("ENABLE_MQTT", "True").lower() == "true"
ENABLE_INFLUXDB = os.getenv("ENABLE_INFLUXDB", "True").lower() == "true"
ENABLE_HISTORICAL = os.getenv("ENABLE_HISTORICAL", "True").lower() == "true"
ENABLE_PROMETHEUS = os.getenv("ENABLE_PROMETHEUS", "True").lower() == "true"
ENABLE_API = os.getenv("ENABLE_API", "True").lower() == "true"
ENABLE_STORE_SIMULATOR = os.getenv("ENABLE_STORE_SIMULATOR", "True").lower() == "true"


# Device Simulation Settings
DEVICE_COUNTS = {
    "Refrigerator": int(os.getenv("REFRIGERATOR_COUNT", 2)),
    "Scale": int(os.getenv("SCALE_COUNT", 2)),
    "POS": int(os.getenv("POS_COUNT", 2)),
    "SmartShelf": int(os.getenv("SMARTSHELF_COUNT", 2)),
    "HVAC": int(os.getenv("HVAC_COUNT", 2)),
    "LightingSystem": int(os.getenv("LIGHTINGSYSTEM_COUNT", 2)),
    "AutomatedCheckout": int(os.getenv("AUTOMATEDCHECKOUT_COUNT", 10))
}

# Connect to MQTT Broker
client_id1 = f'python-mqtt-{random.randint(0, 1000)}'
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

# Flask app and Swagger initialization
app = Flask(__name__)
swagger = Swagger(app)

# Store metrics data in memory
devices_metrics = {}

# Set up logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom logging handler to count log messages
class PrometheusLogHandler(logging.Handler):
    def emit(self, record):
        LOG_MESSAGES.labels(level=record.levelname).inc()

logger.addHandler(PrometheusLogHandler())

# Function to increment the data points counter
def increment_data_points(equipment_type, device_id):
    DATA_POINTS_GENERATED.labels(equipment_type=equipment_type, device_id=device_id).inc()

def update_device_metrics(equipment_type, device_id, data):
    """Helper function to store latest metrics in memory"""
    key = f"{equipment_type}_{device_id}"
    devices_metrics[key] = {
        "equipment_type": equipment_type,
        "device_id": device_id,
        "last_updated": datetime.utcnow().isoformat(),
        "metrics": data
    }

def generate_equipment_data(equipment_type, device_id, pk):
    data = {"id": pk, "device_id": device_id}
    
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
            "items_sold": float(random.randint(1, 10)),
            "total_amount_usd": round(random.uniform(10, 500), 2),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
        })
    
    elif equipment_type == "SmartShelf":
        data.update({
            "product_id": f"prod_{random.randint(1000, 9999)}",
            "stock_level": float(random.randint(0, 100)),
            "threshold_stock_level": float(random.randint(10, 20)),
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
            "items_scanned": float(random.randint(1, 10)),
            "total_amount_usd": round(random.uniform(10, 500), 2),
            "payment_method": random.choice(["credit_card", "cash", "mobile_payment"]),
            "errors": float(random.randint(0, 5)),
            "status": random.choice(["open", "closed"]),
            "avgWaitTime": float(random.randint(0, 3)),
            "queueLength": float(random.randint(0, 3))
        })
    
    return data

def write_data_to_influxdb(equipment_type, device_id, measurement_name, timestamp, data):
    if not ENABLE_INFLUXDB:
        return
    
    try:
        point = Point(measurement_name).time(timestamp, WritePrecision.NS)
        for key, value in data.items():
            if isinstance(value, (int, float)):
                point.field(key, float(value))
            elif isinstance(value, bool):
                point.field(key, value)
            elif isinstance(value, str):
                point.tag(key, value)
            else:
                logger.warning(f"Skipping field {key} with unsupported type {type(value)}")
                
        write_api.write(bucket=INFLUXDB_BUCKET, record=point)

        if VERBOSE:
            logger.info(f"Data for {device_id} written to InfluxDB: {data}")
    
    except Exception as e:
        logger.error(f"Error writing data to InfluxDB for {device_id}: {str(e)}")

def publish_data_to_mqtt(equipment_type, device_id, timestamp, data):
    if not ENABLE_MQTT:
        return
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
            time.sleep(5)
        except Exception as e:
            logger.error(f"Error updating system metrics: {str(e)}")
            time.sleep(5)

def update_prometheus_metrics(equipment_type, device_id, data):
    if not ENABLE_PROMETHEUS:
        return
    try:
        # Update in-memory metrics first
        update_device_metrics(equipment_type, device_id, data)
        
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
    except Exception as e:
        logger.error(f"Error updating metrics for {device_id}: {str(e)}")
        LOG_MESSAGES.labels(level="error").inc()

def update_backend_api(equipment_type, pk, data):
    url = UI_API_URL
    if equipment_type == "HVAC":
        url += f"/hvacs/{pk}"
        try:
            payload = {
                **data
            }
            response = requests.put(url, json=payload)
            response.raise_for_status()
            logger.info(f"Successfully updated backend API for {pk}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to update backend API for {pk}: {str(e)}")

def simulate_device(pk, equipment_type, device_id):
    while True:
        try:
            timestamp = datetime.utcnow().isoformat()
            data = generate_equipment_data(equipment_type, device_id, pk)

            measurement_name = f"{device_id}_{equipment_type.lower()}_data"
            
            # Write to InfluxDB
            if ENABLE_INFLUXDB:
                write_data_to_influxdb(equipment_type, device_id, measurement_name, timestamp, data)
            
            # Publish to MQTT
            if ENABLE_MQTT:
                publish_data_to_mqtt(equipment_type, device_id, timestamp, data)

            # Update Prometheus metrics
            if ENABLE_PROMETHEUS:
                update_prometheus_metrics(equipment_type, device_id, data)

            # Update backend API
            if ENABLE_API:
                update_backend_api(equipment_type, pk, data)

            # Increment the data points counter
            increment_data_points(equipment_type, device_id)
            
            time.sleep(random.uniform(8, 12))  # Random sleep between 8 and 12 seconds
        except Exception as e:
            logger.error(f"Error in {device_id} simulation: {str(e)}")
            time.sleep(5)  # Wait a bit before retrying

def get_open_automated_checkouts():
    devices = get_devices().json
    open_automated_checkouts = 0
    total_checkouts = 0
    avg_wait_time = 0
    queue_length = 0
    for device in devices:
        device_id = device.get('device_id')
        equipment_type = device.get('equipment_type')
        key = f"{equipment_type}_{device_id}"
        metrics = devices_metrics[key].get('metrics', {})
        if device.get('equipment_type') == 'AutomatedCheckout':
            total_checkouts += 1
            queue_length = queue_length + metrics.get('queueLength')
            avg_wait_time = avg_wait_time + metrics.get('avgWaitTime')
            if metrics.get('status') == 'open':
                open_automated_checkouts += 1
    closed_automated_checkouts = total_checkouts - open_automated_checkouts
    avg_wait_time = avg_wait_time / total_checkouts

    return jsonify({'open_automated_checkouts': open_automated_checkouts, 'closed_automated_checkouts': closed_automated_checkouts, 'total_checkouts': total_checkouts, 'avg_wait_time': avg_wait_time, 'queue_length': queue_length})

# REST API Endpoints
@app.route('/api/v1/automated_checkouts/open', methods=['GET'])
@swag_from({
    'responses': {
        200: {
            'description': 'Number of open AutomatedCheckouts and total checkouts',
            'schema': {
                'type': 'object',
                'properties': {
                    'open_automated_checkouts': {'type': 'integer'},
                    'total_checkouts': {'type': 'integer'}
                }
            }
        }
    },
    'summary': 'Returns the number of open AutomatedCheckouts and total checkouts',
    'tags': ['AutomatedCheckouts']
})
def get_open_automated_checkouts_endpoint():
    return get_open_automated_checkouts()

@app.route('/api/v1/devices', methods=['GET'])
@swag_from({
    'responses': {
        200: {
            'description': 'List of all available devices',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'equipment_type': {'type': 'string'},
                        'device_id': {'type': 'string'},
                        'last_updated': {'type': 'string', 'format': 'date-time'}
                    }
                }
            }
        }
    },
    'summary': 'Returns a list of all devices being monitored',
    'tags': ['Devices']
})
def get_devices():
    devices = []
    for device_data in devices_metrics.values():
        devices.append({
            'equipment_type': device_data['equipment_type'],
            'device_id': device_data['device_id'],
            'last_updated': device_data['last_updated']
        })
    return jsonify(devices)

@app.route('/api/v1/devices/<equipment_type>/<device_id>/metrics', methods=['GET'])
@swag_from({
    'parameters': [
        {
            'name': 'equipment_type',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Type of equipment (e.g., Refrigerator, HVAC)'
        },
        {
            'name': 'device_id',
            'in': 'path',
            'type': 'string',
            'required': True,
            'description': 'Device identifier'
        }
    ],
    'responses': {
        200: {
            'description': 'Device metrics',
            'schema': {
                'type': 'object',
                'properties': {
                    'equipment_type': {'type': 'string'},
                    'device_id': {'type': 'string'},
                    'last_updated': {'type': 'string', 'format': 'date-time'},
                    'metrics': {'type': 'object'}
                }
            }
        },
        404: {
            'description': 'Device not found'
        }
    },
    'summary': 'Get metrics for a specific device',
    'tags': ['Metrics']
})
def get_device_metrics(equipment_type, device_id):
    key = f"{equipment_type}_{device_id}"
    if key not in devices_metrics:
        return jsonify({'error': 'Device not found'}), 404
    
    return jsonify(devices_metrics[key])

@app.route('/metrics')
def metrics():
    return Response(generate_latest(REGISTRY), mimetype="text/plain")

# Configure Swagger
app.config['SWAGGER'] = {
    'title': 'IoT Device Simulator API',
    'description': 'API for accessing IoT device metrics and status',
    'version': '1.0.0',
    'uiversion': 3,
    'tags': [
        {
            'name': 'Devices',
            'description': 'Operations related to devices'
        },
        {
            'name': 'Metrics',
            'description': 'Operations related to device metrics'
        }
    ],
    'specs': [
        {
            'endpoint': 'apispec',
            'route': '/apispec.json',
            'rule_filter': lambda rule: True,  # all in
            'model_filter': lambda tag: True,  # all in
        }
    ],
    'static_url_path': '/flasgger_static',
    'swagger_ui': True,
    'specs_route': '/apidocs/'
}

# Connect to InfluxDB
client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

if __name__ == "__main__":
    from threading import Thread
    
    # Start Flask app with Swagger UI
    if ENABLE_API:
        Thread(target=lambda: app.run(host="0.0.0.0", port=PORT, use_reloader=False)).start()
        logger.info(f"API documentation available at http://localhost:{PORT}/apidocs")
    
    # Start system metrics update in a separate thread
    if ENABLE_PROMETHEUS:
        Thread(target=update_system_metrics, daemon=True).start()
        logger.info("System metrics update thread started")

    # Start store simulator in a separate thread
    if ENABLE_STORE_SIMULATOR:
        store_simulator_thread = Thread(target=run_store_simulator, daemon=True)
        store_simulator_thread.start()
        logger.info("Store simulator started")

    if ENABLE_MQTT:
        try:
            mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
            mqtt_client.loop_start()
        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}")

    # Create a list of all devices to simulate
    devices_to_simulate = []
    pk = 1
    for equipment_type, count in DEVICE_COUNTS.items():
        for i in range(count):
            device_id = f"{equipment_type}{i+1:02d}"
            devices_to_simulate.append((pk, equipment_type, device_id))
            pk=pk+1
    
    logger.info(f"Preparing to simulate {len(devices_to_simulate)} devices")

    # Use a ThreadPoolExecutor to run device simulations in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(devices_to_simulate)) as executor:
        futures = [executor.submit(simulate_device, pk, equipment_type, device_id) 
                   for pk, equipment_type, device_id in devices_to_simulate]
        
        logger.info("All device simulation threads started")
        
        try:
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
