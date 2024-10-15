from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import random
import time
from datetime import datetime
import os

# InfluxDB Settings
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")
VERBOSE = bool(os.getenv("VERBOSE", "False"))

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

if __name__ == "__main__":
    while True:
        timestamp = datetime.utcnow().isoformat()
        # Write data for different types of equipment
        write_data_to_influxdb("Refrigerator", "refrigerator_data", timestamp)
        write_data_to_influxdb("Scale", "scale_data", timestamp)
        write_data_to_influxdb("POS", "pos_data", timestamp)
        write_data_to_influxdb("SmartShelf", "smart_shelf_data", timestamp)
        write_data_to_influxdb("HVAC", "hvac_data", timestamp)
        write_data_to_influxdb("LightingSystem", "lighting_system_data", timestamp)
        write_data_to_influxdb("AutomatedCheckout", "automated_checkout_data", timestamp)
        
        time.sleep(60)
        