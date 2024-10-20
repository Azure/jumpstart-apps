# Use a base Python image
FROM python:3.12-slim

# Copy application files to the container
COPY . /app

# Set the working directory
WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Define environment variables
ENV INFLUXDB_URL="http://10.0.0.4:8086"
ENV INFLUXDB_TOKEN="secret-token"
ENV INFLUXDB_ORG="InfluxData"
ENV INFLUXDB_BUCKET="genie"
ENV VERBOSE=True
ENV PORT=8001

EXPOSE 8001

# Command to run the application
CMD ["python", "app.py"]