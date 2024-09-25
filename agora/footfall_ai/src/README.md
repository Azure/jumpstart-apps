# Footfall web frontend

## Prerequisites

- Python 3.8 virtual environment

```bash
sudo apt install python3.8-venv
```

- Git

```bash
sudo apt install git
```

- Image Processor Application is configured and running. Please make sure the Image Processor Application's setting are set per the below section 'Setting up the environment'.

- Image Server Application is configured and running. Please make sure the Image Processor Application's setting are set per the below section 'Setting up the environment'.

## Setting up the environment

The Footfall application has the following configurations that need to be updated according to your environment. Please make sure the following settings are set per Image Processor Application and Image Server Application.

- ImageServerIP = "127.0.0.1"
- ImageServerPort = 65432

The above two are mentioned in app.py as:

```python

send_image(encoded_img, '127.0.0.1', 65432)

```
- Image URL
The Image URL or the inference image URL is mentioned in the /templates/index.html as:

```javascript

const url = "http://localhost:7778/received_image.jpg";

```

## Install steps

- Step 1: Create virtual environment

```bash
python3 -m venv openvino_env
```

- Step 2: Activate virtual environment

```bash
source openvino_env/bin/activate
```

- Step 3: Upgrade pip to latest version
python -m pip install --upgrade pip

- Step 4: Download and install the package

```bash
    pip install openvino==2024.3.0
```

- Step 5: Extra steps - Incase git is not installed
    If git is not installed, please install

    ```bash
    sudo apt install git
    ```

- update OS

```bash
sudo apt-get update
sudo apt-get upgrade
```

- Step 6: Install required packages

```bash
pip install -r requirements.txt
```

## Run steps

- Step 1: Activate the Environment

```bash
source openvino_env/bin/activate
```

- Step 3: Launching the Footfall Application

```bash

cd footfall\src
flast run

````