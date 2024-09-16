# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Copy application files to the container
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables
ENV MQTT_BROKER=""
ENV MQTT_PORT=1883
ENV MQTT_TOPIC1="topic/productionline"
ENV MQTT_TOPIC2="topic/fryer"
ENV INFLUX_URL=""
ENV INFLUX_TOKEN=""
ENV INFLUX_ORG=""
ENV INFLUX_BUCKET=""

COPY . .
 
# Command to run the application
CMD ["/usr/bin/python3", "mqtt-listener.py"]