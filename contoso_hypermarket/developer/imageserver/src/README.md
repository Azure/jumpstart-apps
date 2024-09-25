# Image Server application

## Setting up the environment
The image server requires the following values to be set.
Please ensure you change the following settings in the imageserver.py, according to your environment.

- ImageServerIP = "127.0.0.1"
- ImageServerPort = 7778
- ImageServerFolder = "/home/nabeel/received_images/"

In addition to that, please make sure that 'ImageServerFolder' location has persmissions set to allow Image Server Application to read files from.
## Running the App

```bash
python3 imageserver.py
```