# Use the official Python image
FROM python:3.9-slim

# Install Tini and Supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create the application directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app

ENV AZURE_OPENAI_API_KEY=<your_azure_openai_api_key> \
    CHATGPT_MODEL=gpt-35-turbo \
    AZURE_OPENAI_ENDPOINT=<your_azure_openai_endpoint> \
    OPENAI_API_VERSION=2024-03-01-preview \
    # Environment variables for InfluxDB
    INFLUXDB_URL=http://influxdb.genie.svc.cluster.local:8086 \
    INFLUXDB_BUCKET=genie \
    INFLUXDB_TOKEN=secret-token \
    INFLUXDB_ORG=InfluxData \
    # Environment variables for SQL
    SQL_DATABASE=RetailDB \
    SQL_SERVER=10.0.0.4 \
    SQL_USERNAME=SA \
    SQL_PASSWORD=ArcPassword123!!

# Copy the Supervisor configuration
COPY supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports that the applications will use
EXPOSE 5004 8000

# Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]