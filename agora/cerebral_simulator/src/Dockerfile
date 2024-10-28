# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Copy application files to the container
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Define environment variables
ENV INFLUXDB_URL="http://10.0.0.4:8086"
ENV INFLUXDB_TOKEN="secret-token"
ENV INFLUXDB_ORG="InfluxData"
ENV INFLUXDB_BUCKET="genie"
ENV VERBOSE=True
ENV PORT=8001
ENV MQTT_BROKER=localhost
ENV MQTT_PORT=1883
ENV MQTT_TOPIC=iot/devices
ENV REFRIGERATOR_COUNT=3
ENV SCALE_COUNT=2
ENV POS_COUNT=5
ENV SMARTSHELF_COUNT=3
ENV HVAC_COUNT=3
ENV LIGHTINGSYSTEM_COUNT=3
ENV AUTOMATEDCHECKOUT_COUNT=3
ENV EVENTHUB_CONNECTION_STRING=
ENV ORDERS_EVENTHUB_NAME=ORDERS
ENV INVENTORY_EVENTHUB_NAME=INVENTORY
ENV HISTORICAL_DATA_DAYS=1
ENV ORDER_FREQUENCY=10
ENV PRODUCTS_FILE=products.json
ENV UI_API_URL="http://localhost:5002"

EXPOSE 8001

# Run main.py when the container launches
CMD ["/usr/bin/python3", "app.py"]
