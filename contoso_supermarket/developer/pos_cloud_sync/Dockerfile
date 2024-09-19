# Use a base Python image
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Copy application files to the container
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "/usr/bin/python3", "cloudsync.py"]