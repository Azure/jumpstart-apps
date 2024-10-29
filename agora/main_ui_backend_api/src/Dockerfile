# Use the official Python image
# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Create the application directory
WORKDIR /app

# Install PostgreSQL client
RUN tdnf install -y postgresql

# Copy requirements.txt and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app

ENV MQTT_BROKER "test.mosquitto.org"
ENV MQTT_PORT "1883"
ENV MQTT_TOPIC "Store/Cameras/PeopleCount"
ENV FOOTFALL_API  "http://footfall-api:5003/status"
ENV SI_API "http://shopper-experience-api:5002/status"

# Expose the ports that the applications will use
EXPOSE 5002

# Start app
ENTRYPOINT ["/bin/bash", "init-db.sh"]