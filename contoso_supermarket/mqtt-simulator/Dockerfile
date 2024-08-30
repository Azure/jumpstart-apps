# To use the latest python version in Mariner, use the following FROM instruction.
FROM mcr.microsoft.com/cbl-mariner/base/python:3

# Create app directory. Replace this with your desired work directory e.g., /app.
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "/usr/bin/python3", "./mqtt-simulator/main.py" ]