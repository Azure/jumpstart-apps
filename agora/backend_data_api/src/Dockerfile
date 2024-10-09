# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Create the application directory
WORKDIR /usr/src/app

# Copy requirements.txt and install dependencies
COPY requirements.txt /usr/src/app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . /usr/src/app

# Make port 5000 available to the world outside this container
EXPOSE 5002

# Run the application
CMD ["python", "app.py"]