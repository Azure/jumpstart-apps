# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/pytorch:2

# Copy application files to the container
WORKDIR /usr/src/app

# Install necessary dependencies
USER root
RUN tdnf install -y mesa-libGL

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make port 80 available to the world outside this container
EXPOSE 8000

# Run main.py when the container launches
CMD ["python", "main.py"]

