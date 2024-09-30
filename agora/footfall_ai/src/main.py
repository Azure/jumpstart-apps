from flask import Flask, render_template, Response
import cv2
from flask import request
import gc
import os

import time
from VideoCapture import VideoCapture

from ultralytics.solutions import ObjectCounter
import collections
from ultralytics import YOLO
import numpy as np
import torch

# Check if CUDA is available and set the device accordingly
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load the YOLO model onto the specified device
det_model = YOLO("C:\\Users\\fcabrera\\Downloads\\jumpstart-apps\\agora\\footfall_ai\\src\\models\\yolov8n.pt").to(device)
app = Flask(__name__)
gc.collect()

print(f"Model loaded on: {next(det_model.model.parameters()).device}")

vs = None
frame_rate = 25
fps = 0
start_time2 = time.time()


rtsp_url = os.getenv("RTSP_URL", "rtsp://localhost:554/stream")

x1, y1, w, h= 0, 0, 0, 0
line_points = [(x1, y1), (x1 + w, y1), (x1 + w, y1 + h), (x1, y1 + h), (x1, y1)]  # line or region points
classes_to_count = [0]  # person is class 0 in the COCO dataset
counter = ObjectCounter(
    view_img=False, reg_pts=line_points, names=det_model.names, 
    draw_tracks=True, line_thickness=2, view_in_counts=False, view_out_counts=False
)


def gen_frames_with_source():
    global fps, frame_rate, start_time2
    while True:
        if(vs is None):
            continue

        frame,success = vs.read()
        start_time = time.time()
        if not success:
            break

        loop_time = time.time() - start_time
        delay = max(1, int((1 / frame_rate - loop_time) * 1000))
        key = cv2.waitKey(delay) & 0xFF

        if key == ord('q'):
            break

        loop_time2 = time.time() - start_time
        if loop_time2 > 0:
            fps = 0.9 * fps + 0.1 / loop_time2

        cv2.putText(frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)

        if(x1 != 0 or y1 != 0 or w != 0 or h != 0):
            ret, frame = run_inference(frame)
        else:
            ret, frame = cv2.imencode('.jpg', frame)

        ui_bytes = frame.tobytes()

        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + ui_bytes + b'\r\n')


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
    _, f_width = frame.shape[:2]

    cv2.putText(frame, f"Inference time: {processing_time:.1f}ms ({fps:.1f} FPS)", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)
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

    return cv2.imencode(ext=".jpg", img=frame)


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/shopper")
def shopper():
    return render_template('shopper/landing2.html')

@app.route('/video_feed')
def video_feed():
    video_source = request.args.get('source', default="")
    aux_x1 = int(request.args.get('x', default=0))
    aux_y1 = int(request.args.get('y', default=0))
    aux_w = int(request.args.get('w', default=0))
    aux_h = int(request.args.get('h', default=0))

    global vs
    vs = VideoCapture(video_source)
    # Print the height and width of the frames from the video source
    frame = vs.read()[0]
    if frame is not None:
        height, width = frame.shape[:2]
        print(f"Frame dimensions: Width={width}, Height={height}")

    # Calculate the scaling factors
    scaling_factor_x = width / 640
    scaling_factor_y = height / 360

    # Scale the auxiliary variables
    aux_x1 = int(aux_x1 * scaling_factor_x)
    aux_y1 = int(aux_y1 * scaling_factor_y)
    aux_w = int(aux_w * scaling_factor_x)
    aux_h = int(aux_h * scaling_factor_y)

    global x1, y1, w, h
    if aux_x1 != x1 or aux_y1 != y1 or aux_w != w or aux_h != h:
        x1, y1, w, h = aux_x1, aux_y1, aux_w, aux_h

        global line_points, counter
        # Define the rectangle points using (x1, y1) as the top-left corner and (w, h) as width and height
        line_points = [
            (x1, y1),          # Top-left corner
            (x1 + w, y1),      # Top-right corner
            (x1 + w, y1 + h),  # Bottom-right corner
            (x1, y1 + h),      # Bottom-left corner
            (x1, y1)           # Closing the rectangle
        ]
        counter = ObjectCounter(
            view_img=False, reg_pts=line_points, names=det_model.names, draw_tracks=True, line_thickness=2, view_in_counts=False, view_out_counts=False
        )

    return Response(gen_frames_with_source(),
            mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True, threaded=True)