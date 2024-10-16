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

# Expose the ports that the applications will use
EXPOSE 5002

# Start app
ENTRYPOINT ["/bin/bash", "init-db.sh"]