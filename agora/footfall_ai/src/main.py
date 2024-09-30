import os
import time
import collections
import cv2
import numpy as np
import torch
from flask import Flask, render_template, Response, request
from ultralytics import YOLO
from ultralytics.solutions import ObjectCounter
from video_capture import VideoCapture

# Constants
MODEL_PATH = "C:\\Users\\fcabrera\\Downloads\\jumpstart-apps\\agora\\footfall_ai\\src\\models\\yolov8n.pt"
RTSP_URL = os.getenv("RTSP_URL", "rtsp://localhost:554/stream")
FRAME_RATE = 25
CLASSES_TO_COUNT = [0]  # person is class 0 in the COCO dataset

# Initialize Flask app
app = Flask(__name__)

# Global variables
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
det_model = YOLO(MODEL_PATH).to(device)
vs = None
fps = 0
counter = None
line_points = [(0, 0), (0, 0), (0, 0), (0, 0), (0, 0)]

print(f"Using device: {device}")
print(f"Model loaded on: {next(det_model.model.parameters()).device}")

def initialize_counter():
    global counter
    counter = ObjectCounter(
        view_img=False,
        reg_pts=line_points,
        names=det_model.names,
        draw_tracks=True,
        line_thickness=2,
        view_in_counts=False,
        view_out_counts=False
    )

def gen_frames_with_source():
    global fps, vs
    last_time = time.time()
    frame_count = 0

    while True:
        if(vs is None):
            continue

        frame,success = vs.read()
        start_time = time.time()
        if not success:
            break

        frame_count += 1
        current_time = time.time()
        if current_time - last_time >= 1:
            fps = frame_count / (current_time - last_time)
            frame_count = 0
            last_time = current_time

        cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)

        if all(point == (0, 0) for point in line_points):
            ret, frame = cv2.imencode('.jpg', frame)
        else:
            ret, frame = run_inference(frame)

        ui_bytes = frame.tobytes()

        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + ui_bytes + b'\r\n')

def run_inference(frame):
    global counter
    processing_times = collections.deque(maxlen=200)
    start_time = time.time()

    tracks = det_model.track(frame, persist=True, classes=CLASSES_TO_COUNT, verbose=False)
    frame = counter.start_counting(frame, tracks)

    processing_time = (time.time() - start_time) * 1000
    processing_times.append(processing_time)
    avg_processing_time = np.mean(processing_times)
    inference_fps = 1000 / avg_processing_time

    cv2.putText(frame, f"Inference time: {avg_processing_time:.1f}ms ({inference_fps:.1f} FPS)", 
                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)

    counts = counter.out_counts
    text = f"Current count: {counts}"
    text_size, _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_COMPLEX, 0.75, 2)
    top_right_corner = (frame.shape[1] - text_size[0] - 20, 40)

    cv2.putText(frame, text, top_right_corner, cv2.FONT_HERSHEY_COMPLEX, 
                0.75, (0, 0, 255), 2, cv2.LINE_AA)

    return cv2.imencode('.jpg', frame)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/shopper")
def shopper():
    return render_template('shopper/landing2.html')

@app.route('/video_feed')
def video_feed():
    global vs, line_points
    video_source = request.args.get('source', default="")
    x1 = int(request.args.get('x', default=0))
    y1 = int(request.args.get('y', default=0))
    w = int(request.args.get('w', default=0))
    h = int(request.args.get('h', default=0))

    vs = VideoCapture(video_source)
    frame = vs.read()[0]
    if frame is not None:
        height, width = frame.shape[:2]
        scaling_factor_x = width / 640
        scaling_factor_y = height / 360

        x1 = int(x1 * scaling_factor_x)
        y1 = int(y1 * scaling_factor_y)
        w = int(w * scaling_factor_x)
        h = int(h * scaling_factor_y)

        line_points = [
            (x1, y1), (x1 + w, y1), (x1 + w, y1 + h), (x1, y1 + h), (x1, y1)
        ]
        initialize_counter()

    return Response(gen_frames_with_source(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True, threaded=True)