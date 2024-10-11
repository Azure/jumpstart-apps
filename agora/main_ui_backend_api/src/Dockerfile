# Use the official Python image
# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Install Tini and Supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create the application directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app

# Copy the Supervisor configuration
COPY supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports that the applications will use
EXPOSE 6000 9000

# Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]