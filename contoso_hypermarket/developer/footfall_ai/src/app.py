# Flask Libraries
from flask import Flask
from markupsafe import escape
from flask import render_template
from flask import request
import sys

# OpenVino Libraries
from pathlib import Path
from ultralytics import YOLO
from ultralytics.solutions import ObjectCounter
import cv2
import time
import collections
import numpy as np
from IPython import display
import torch
import openvino as ov
import gc

#sockets
import socket

# This function sends binary image data to the image server.
# This will be called constantly as new image data is being generated through inferencing.
def send_image(image_data, server_ip, server_port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
        client_socket.connect((server_ip, server_port))
        client_socket.sendall(image_data)
        print("image sent successfully")
        client_socket.close()
        print("socket closed")
    
def write(inline=''):
    sys.stdout.write(inline)
    sys.stdout.write('\r\n')
    sys.stdout.flush()

def run_inference(det_model_path, det_model, source, device_value,x1,y1,x2,y2):
    gc.collect()
    
    write("Content-type: text/html\r\n")
    core = ov.Core()
    det_ov_model = core.read_model(det_model_path)
    ov_config = {} 

    if device_value != "CPU":
        det_ov_model.reshape({0: [1, 3, 640, 640]})
    if "GPU" in device_value or ("AUTO" in device_value and "GPU" in core.available_devices):
        ov_config = {"GPU_DISABLE_WINOGRAD_CONVOLUTION": "YES"}
    compiled_model = core.compile_model(det_ov_model, device_value, ov_config)
    print("Compiled model");
    print(compiled_model)
    def infer(*args):
        result = compiled_model(args)
        return torch.from_numpy(result[0])

    # Use openVINO as inference engine
    det_model.predictor.inference = infer
    det_model.predictor.model.pt = False

    try:
        cap = cv2.VideoCapture(source)
        assert cap.isOpened(), "Error reading video file"

        #line_points = [(0, 300), (1080, 300)]  # line or region points
        #line_points = [(0, 400), (600, 400),(600, 0),(0,0),(0,400)]  # line or region points
        line_points = [(x1, y1), (x1 + x2, y1),(x1 + x2, y1+y2),(x1,y1 + y2),(x1,y1)]  # line or region points        
        classes_to_count = [0]  # person is class 0 in the COCO dataset
        print("classes_to_count")
        print(classes_to_count)
        # Init Object Counter
        print("**** BEFORE object counter****")
        counter = ObjectCounter(
            view_img=False, reg_pts=line_points, classes_names=det_model.names, draw_tracks=True, line_thickness=2, view_in_counts=False, view_out_counts=False
        )
        print("**** AFTER object counter****")
        # Processing time
        processing_times = collections.deque(maxlen=200)
        selfCounter = 0

        while cap.isOpened():
            selfCounter = selfCounter + 1
            success, frame = cap.read()
            # print("The counter is: " + str(selfCounter))
            if not success:
                print("Video frame is empty or video processing has been successfully completed.")
                break

            start_time = time.time()
            tracks = det_model.track(frame, persist=True, show=False, classes=classes_to_count, verbose=False)
            frame = counter.start_counting(frame, tracks)
            stop_time = time.time()

            processing_times.append(stop_time - start_time)

            # Mean processing time [ms].
            _, f_width = frame.shape[:2]
            processing_time = np.mean(processing_times) * 1000
            fps = 1000 / processing_time
            cv2.putText(
                img=frame,
                text=f"Inference time: {processing_time:.1f}ms ({fps:.1f} FPS)",
                org=(20, 40),
                fontFace=cv2.FONT_HERSHEY_COMPLEX,
                fontScale=f_width / 1000,
                color=(0, 0, 255),
                thickness=2,
                lineType=cv2.LINE_AA,
            )
            print(f"Inference time: {processing_time:.1f}ms ({fps:.1f} FPS)")
            # Get the counts. Counts are getting as 'OUT'
            # Modify this logic accordingly
            counts = counter.out_counts

            # Define the text to display
            text = f"Current count: {counts}"
            fontFace = cv2.FONT_HERSHEY_COMPLEX
            fontScale = 0.75  # Adjust scale as needed
            thickness = 2

            # Calculate the size of the text box
            (text_width, text_height), _ = cv2.getTextSize(text, fontFace, fontScale, thickness)

            # Define the upper right corner for the text
            top_right_corner = (frame.shape[1] - text_width - 20, 40)
            # Draw the count of "OUT" on the frame
            cv2.putText(
                img=frame,
                text=text,
                org=(top_right_corner[0], top_right_corner[1]),
                fontFace=fontFace,
                fontScale=fontScale,
                color=(0, 0, 255),
                thickness=thickness,
                lineType=cv2.LINE_AA,
            )
            print(text)
            # Show the frame
            _, encoded_img = cv2.imencode(ext=".jpg", img=frame, params=[cv2.IMWRITE_JPEG_QUALITY, 100])
            
            print("encoded_img")
            print(encoded_img)
            
            send_image(encoded_img, '127.0.0.1', 65432)
            write(text)
            #return "home"
            
    except KeyboardInterrupt:
        print("Interrupted")

    cap.release()
    cv2.destroyAllWindows()    


app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/shopper")
def shopper():
    return render_template('shopper/landing2.html')

@app.route("/inference", methods=["POST"])
def runInference():
    print(request.form)
    print(request.form['videoSource'])
    print(request.form['txtVideoSource'])
    VIDEO_SOURCE = request.form['videoSource']
    if request.form['txtVideoSource'] != "":
        VIDEO_SOURCE = request.form['txtVideoSource']
    
    print("**************Video Source is ")
    print (VIDEO_SOURCE)
    x1 = int(request.form['txtX1'])
    y1 = int(request.form['txtY1'])
    x2 = int(request.form['txtX2'])
    y2 = int(request.form['txtY2'])
    print(x1,y1,x2,y2)
    

    models_dir = Path("./models")
    models_dir.mkdir(exist_ok=True)

    DET_MODEL_NAME = "yolov8n"

    det_model = YOLO(models_dir / f"{DET_MODEL_NAME}.pt")
    label_map = det_model.model.names

    # Need to make en empty call to initialize the model
    res = det_model()
    det_model_path = models_dir / f"{DET_MODEL_NAME}_openvino_model/{DET_MODEL_NAME}.xml"
    if not det_model_path.exists():
        det_model.export(format="openvino", dynamic=True, half=True)

    WEBCAM_INFERENCE = False

    core = ov.Core()

    return run_inference(det_model_path, det_model, source=VIDEO_SOURCE, device_value="AUTO", x1=x1,y1=y1,x2=x2, y2=y2)
