# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /python-docker

# Since we do not have any requirements for the code to run. We have commented out the following two lines. Need to remove the comment once we have requirements.txt file.
# COPY requirements.txt requirements.txt
# RUN pip3 install -r requirements.txt

COPY . .

CMD [ "python3", "imageserver.py"]