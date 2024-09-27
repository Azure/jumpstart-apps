from flask import Flask, render_template, Response
import cv2
from flask import request
import openvino as ov
import gc
import torch
from ultralytics.solutions import ObjectCounter
import collections
import time
import os
from ultralytics import YOLO
import numpy as np

from CountsPerSec import CountsPerSec
from VideoGet import VideoGet
from VideoInference import VideoInference

app = Flask(__name__)
core = ov.Core()
det_model = YOLO("C:\\Users\\fcabrera\\Downloads\\jumpstart-apps\\agora\\footfall_ai\\src\\models\\yolov8n.pt")

device_value = os.getenv("DEVICE_VALUE", "AUTO")
rtsp_url = os.getenv("RTSP_URL", "rtsp://localhost:554/stream")

gc.collect()

x1, y1, x2, y2 = 0, 0, 0, 0
line_points = [(x1, y1), (x1 + x2, y1), (x1 + x2, y1 + y2), (x1, y1 + y2), (x1, y1)]  # line or region points
classes_to_count = [0]  # person is class 0 in the COCO dataset
counter = ObjectCounter(
    view_img=False, reg_pts=line_points, classes_names=det_model.names, 
    draw_tracks=True, line_thickness=2, view_in_counts=False, view_out_counts=False
)

def gen_frames_with_source(source):
    cap = cv2.VideoCapture(source)

    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            global x1, y1, x2, y2
            if(x1 != 0 or y1 != 0 or x2 != 0 or y2 != 0):
                ret, buffer = run_inference(frame)
            else:
                ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def run_inference(frame):
    # Processing time
    processing_times = collections.deque(maxlen=200)
    selfCounter = 0
    start_time = time.time()

    tracks = det_model.track(frame, persist=True, classes=classes_to_count, verbose=False)
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

    return cv2.imencode(ext=".jpg", img=frame, params=[cv2.IMWRITE_JPEG_QUALITY, 100])

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/shopper")
def shopper():
    return render_template('shopper/landing2.html')

@app.route('/video_feed')
def video_feed():
    video_source = request.args.get('source', default=rtsp_url)
    aux_x1 = int(request.args.get('x', default=0))
    aux_y1 = int(request.args.get('y', default=0))
    w = int(request.args.get('w', default=0))
    h = int(request.args.get('h', default=0))
    aux_x2 = aux_x1 + w
    aux_y2 = aux_y1 + h
    
    global x1, y1, x2, y2
    if aux_x1 != x1 or aux_y1 != y1 or aux_x2 != x2 or aux_y2 != y2:
        x1, y1, x2, y2 = aux_x1, aux_y1, aux_x2, aux_y2

        global line_points, counter
        line_points = [(x1, y1), (x1 + x2, y1), (x1 + x2, y1 + y2), (x1, y1 + y2), (x1, y1)]
        counter = ObjectCounter(
            view_img=False, reg_pts=line_points, classes_names=det_model.names, draw_tracks=True, line_thickness=2, view_in_counts=False, view_out_counts=False
        )

    return Response(gen_frames_with_source(video_source),
            mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)