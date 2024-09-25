# Image processor application

## Setting up the environment
The image processor requires the following values to be set.
Please ensure you change the following settings in the imageserver.py, according to your environment.

- ImageServerIP = "localhost"
- ImageServerPort = 65432
- ImageServerDestinationFilePath = "/home/nabeel/received_images/received_image.jpg"


In addition to that, please make sure that 'ImageServerDestinationFilePath' location has persmissions set to allow Image Processor Application to write files to.


## Running the App

```bash
python3 imageprocessor.py
```