# Use a base Python image
FROM python:3.9-slim

RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y curl apt-transport-https gnupg2 \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list

RUN apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && ACCEPT_EULA=Y apt-get install -y mssql-tools18 \
    && apt-get install -y unixodbc-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="$PATH:/opt/mssql-tools18/bin"

# Copy application files to the container
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Define environment variables
ENV INFLUXDB_URL="http://10.0.0.4:8086"
ENV INFLUXDB_TOKEN="secret-token"
ENV INFLUXDB_ORG="InfluxData"
ENV INFLUXDB_BUCKET="cerebral"
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

ENV ENABLE_MQTT=true
ENV ENABLE_INFLUXDB=true
ENV ENABLE_HISTORICAL=true
ENV ENABLE_PROMETHEUS=true
ENV ENABLE_API=true
ENV ENABLE_STORE_SIMULATOR=true

# SQL Server Settings
ENV ENABLE_SQL=true
ENV SQL_SERVER=your_server
ENV SQL_DATABASE=RetailStore
ENV SQL_USERNAME=your_username
ENV SQL_PASSWORD=your_password

EXPOSE 8001

# Run main.py when the container launches
CMD ["/usr/bin/python3", "app.py"]
