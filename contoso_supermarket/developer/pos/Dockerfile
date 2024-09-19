# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Copy application files to the container
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install necessary dependencies
USER root
RUN tdnf install -y mesa-libGL glib2

COPY . .

CMD [ "/usr/bin/python3", "-m" , "flask", "run", "--host=0.0.0.0"]