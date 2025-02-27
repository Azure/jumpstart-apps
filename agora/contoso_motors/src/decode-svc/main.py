# Original code taken from: https://gist.github.com/raiever/df5b6c48217df521094cbe2d12c32c66
# import the necessary packages
# Modified Armando Blanco
from flask import Response, Flask, render_template, jsonify
from flask import request
import threading
import argparse 
import datetime, time
import cv2
import os
import time
import math
import os

from ultralytics import YOLO

model = YOLO("models/safety-yolo8.pt")
#model = YOLO("yolo-Weights/yolov8n.pt")

#classNames = ["person", "bicycle", "car", "motorbike", "aeroplane", "bus", "train", "truck", "boat",
#              "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
#              "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella",
#              "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat",
#              "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup",
#              "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli",
#              "carrot", "hot dog", "pizza", "donut", "cake", "chair", "sofa", "pottedplant", "bed",
#              "diningtable", "toilet", "tvmonitor", "laptop", "mouse", "remote", "keyboard", "cell phone",
#              "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors",
#              "teddy bear", "hair drier", "toothbrush"
#              ]
classNames = ['helmet','head','person']

# initialize the output frame and a lock used to ensure thread-safe
# exchanges of the output frames (useful when multiple browsers/tabs are viewing the stream)
outputFrame = None
lock = threading.Lock()
 
# initialize a flask object
app = Flask(__name__)

source = os.environ.get("rtsp_url", "rtsp://10.211.55.5:8554/stream")
esa_storage = os.environ.get("save_path", "frames")

print("\nRTSP: "+ str(source))
print("\nStorage: "+ str(esa_storage))

cap = cv2.VideoCapture(source)
time.sleep(2.0)

@app.route("/")
def index():
    # return the rendered template
    return render_template("index.html")

def stream(frameCount):
    global outputFrame, lock
    if cap.isOpened():
        # cv2.namedWindow(('IP camera DEMO'), cv2.WINDOW_AUTOSIZE)
        count = 0
        while True:
            ret_val, frame = cap.read()
            if not None and frame.shape:
                if count % 3 != 2:
                    frame = cv2.resize(frame, (640,360))
                    with lock:
                        outputFrame = frame.copy()
                count += 1
            else:
                continue 
    else:
        print('camera open failed')

def generate():
    # grab global references to the output frame and lock variables
    global outputFrame, lock
 
    # loop over frames from the output stream
    while True:
        with lock:
            # check if the output frame is available, otherwise skip
            # the iteration of the loop
            if outputFrame is None:
                continue
 
            results = model(outputFrame, stream=True)

            contains_class = False

            # coordinates
            for r in results:
                boxes = r.boxes

                for box in boxes:
                    # bounding box
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2) # convert to int values

                    # put box in cam
                    cv2.rectangle(outputFrame, (x1, y1), (x2, y2), (139, 163, 255), 2)

                    # confidence
                    confidence = math.ceil((box.conf[0]*100))/100

                    # class name
                    cls = int(box.cls[0])
                    
                    if(confidence > 0.6 and classNames[cls] == "handbag"):
                        contains_class = True

                    # object detailscla
                    org = [x1, y1]
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    fontScale = 1
                    color = (255, 0, 0)
                    thickness = 2

                    cv2.putText(outputFrame, classNames[cls], org, font, fontScale, color, thickness)

            # encode the frame in JPEG format
            (flag, encodedImage) = cv2.imencode(".jpg", outputFrame)

            if contains_class:
                store_jpg_frame(encodedImage)
                print(encodedImage)
 
            # ensure the frame was successfully encoded
            if not flag:
                continue
 
        # yield the output frame in the byte format
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
            bytearray(encodedImage) + b'\r\n')

def store_jpg_frame(frame_data):
    try:    
        current_time = datetime.datetime.now()
        file_name = current_time.strftime("%Y-%m-%d_%H-%M-%S")
        file_name = file_name + ".jpg"
        with open(f"{esa_storage}/{file_name}", "wb") as f:
            f.write(frame_data)
    except:
        print("Error storing the image")

@app.route("/video_feed")
def video_feed():
    # return the response generated along with the specific media
    # type (mime type)
    return Response(generate(),
        mimetype = "multipart/x-mixed-replace; boundary=frame")

@app.route('/data')
def data():
    files = []
    for filename in os.listdir(esa_storage):
        file_path = os.path.join(esa_storage, filename)
        if os.path.isfile(file_path):
            size = os.path.getsize(file_path)
            modified = os.path.getmtime(file_path)
            files.append({'name': filename, 'size': size, 'modified': modified})
    files.sort(key=lambda f: f['modified'], reverse=True)
    return jsonify({'files': files})

@app.route("/configuration")
def configuration():
    models = os.listdir("models")  # Make sure this path is correct
    return render_template("index.html", models=models)

@app.route("/configure", methods=["POST"])
def configure():
    global model, classNames
    selected_model = request.form["model"]
    selected_classNames = request.form["classNames"].split(",")  # Convert to list
    model_path = os.path.join("models", selected_model)
    if os.path.exists(model_path):
        model = YOLO(model_path)
        classNames = selected_classNames
        return "Configuration saved successfully."
    else:
        return "Error loading model."

# check to see if this is the main thread of execution
if __name__ == '__main__':
    # construct the argument parser and parse command line arguments
    ap = argparse.ArgumentParser()
    ap.add_argument("-i", "--ip", type=str, required=False, default='0.0.0.0',
        help="ip address of the device")
    ap.add_argument("-o", "--port", type=int, required=False, default=8000, 
        help="ephemeral port number of the server (1024 to 65535)")
    ap.add_argument("-f", "--frame-count", type=int, default=32,
        help="# of frames used to construct the background model")
    args = vars(ap.parse_args())

    t = threading.Thread(target=stream, args=(args["frame_count"],))
    t.daemon = True
    t.start()
 
    # start the flask app
    app.run(host=args["ip"], port=args["port"], debug=True,
        threaded=True, use_reloader=False)
 
# release the video stream pointer
cap.release()
cv2.destroyAllWindows()