# To use the latest python version in Mariner, use the following FROM instruction.
FROM mcr.microsoft.com/cbl-mariner/base/python:3
 
# Create app directory. Replace this with your desired work directory e.g., /app.
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

ENV MQTT_BROKER="mqtt.eclipse.org"
ENV MQTT_PORT=1883
ENV FRECUENCY=10

COPY . .

# Command to run the application
CMD ["/usr/bin/python3", "mqtt_simulator.py"]