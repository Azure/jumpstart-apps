import os
import time
from flask import Flask, render_template, Response, request, jsonify
import cv2
import numpy as np
from openvino.runtime import Core
import hashlib
import collections
from scipy.spatial.distance import cosine
from video_capture import VideoCapture

# Constants
#MODEL_PATH = os.getenv("MODEL_PATH", "./models/")
MODEL_PATH = os.getenv("MODEL_PATH", "C:\\Users\\fcabrera\\Downloads\\models\\")
RTSP_URL = os.getenv("RTSP_URL", "rtsp://rtsp_stream_container:554/stream")
FRAME_RATE = 25
CLASSES_TO_COUNT = [0]  # person is class 0 in the COCO dataset
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ["true", "1", "t"]

restricted_area = []
ie = Core()
detected_persons = 0
intruders = 0
last_intruder_hash = None
current_intruders = 0
fps = 0

# Initialize Flask app
app = Flask(__name__)

# Load the person detection model
det_model_xml = "person-detection-retail-0013.xml"
det_model_bin = "person-detection-retail-0013.bin"
print(f"Loading model: {os.path.join(MODEL_PATH, det_model_xml)}")
det_model = ie.read_model(model=os.path.join(MODEL_PATH, det_model_xml))
det_compiled_model = ie.compile_model(model=det_model, device_name="CPU")

# Load the person re-identification model
reid_model_xml = "person-reidentification-retail-0287.xml"
reid_model_bin = "person-reidentification-retail-0287.bin"
reid_model = ie.read_model(model=os.path.join(MODEL_PATH, reid_model_xml))
reid_compiled_model = ie.compile_model(model=reid_model, device_name="CPU")

# Get input and output layers
det_input_layer = det_compiled_model.input(0)
det_output_layer = det_compiled_model.output(0)
reid_input_layer = reid_compiled_model.input(0)
reid_output_layer = reid_compiled_model.output(0)

# Get input sizes
det_height, det_width = list(det_input_layer.shape)[2:]
reid_height, reid_width = list(reid_input_layer.shape)[2:]

# Person tracking variables
person_tracker = {}
next_person_id = 0
max_frames_to_track = 30

def point_in_polygon(point, polygon):
    x, y = point
    odd_nodes = False
    j = len(polygon) - 1
    for i in range(len(polygon)):
        xi, yi = polygon[i]['x'], polygon[i]['y']
        xj, yj = polygon[j]['x'], polygon[j]['y']
        if yi < y and yj >= y or yj < y and yi >= y:
            if xi + (y - yi) / (yj - yi) * (xj - xi) < x:
                odd_nodes = not odd_nodes
        j = i
    return odd_nodes

def extract_features(frame, bbox):
    x1, y1, x2, y2 = bbox
    person_image = frame[y1:y2, x1:x2]
    person_image = cv2.resize(person_image, (reid_width, reid_height))
    person_image = np.transpose(person_image, (2, 0, 1))
    person_image = np.expand_dims(person_image, axis=0)
    features = reid_compiled_model([person_image])[reid_output_layer]
    return features.flatten()

def run_inference(frame):
    global detected_persons, intruders, last_intruder_hash, person_tracker, next_person_id, current_intruders
    
    # Preprocess the frame for person detection
    resized_frame = cv2.resize(frame, (det_width, det_height))
    input_frame = np.expand_dims(resized_frame.transpose(2, 0, 1), 0)

    processing_times = collections.deque(maxlen=200)
    start_time = time.time()

    # Perform person detection
    results = det_compiled_model([input_frame])[det_output_layer]
    
    detected_persons = 0
    current_frame_detections = []

    for detection in results[0][0]:
        if detection[2] > 0.5:  # Confidence threshold
            detected_persons += 1
            xmin = int(detection[3] * frame.shape[1])
            ymin = int(detection[4] * frame.shape[0])
            xmax = int(detection[5] * frame.shape[1])
            ymax = int(detection[6] * frame.shape[0])
            
            # Extract features for re-identification
            features = extract_features(frame, (xmin, ymin, xmax, ymax))
            
            current_frame_detections.append((xmin, ymin, xmax, ymax, features))

    # Update person tracker
    new_person_tracker = {}
    for person_id, person_data in person_tracker.items():
        last_bbox, last_features, frames_tracked, is_intruder = person_data
        best_match = None
        min_distance = float('inf')
        
        for detection in current_frame_detections:
            distance = cosine(last_features, detection[4])
            if distance < min_distance:
                min_distance = distance
                best_match = detection

        if best_match and min_distance < 0.3:  # Adjust this threshold as needed
            new_person_tracker[person_id] = (best_match[:4], best_match[4], frames_tracked + 1, is_intruder)
            current_frame_detections.remove(best_match)
        elif frames_tracked < max_frames_to_track:
            new_person_tracker[person_id] = (last_bbox, last_features, frames_tracked + 1, is_intruder)

    # Add new detections
    for detection in current_frame_detections:
        new_person_tracker[next_person_id] = (detection[:4], detection[4], 1, False)
        next_person_id += 1

    # Check for intruders and update counters
    frame_intruders = set()
    for person_id, (bbox, features, frames_tracked, is_intruder) in new_person_tracker.items():
        center_x = (bbox[0] + bbox[2]) // 2
        center_y = (bbox[1] + bbox[3]) // 2
        if point_in_polygon((center_x / frame.shape[1], center_y / frame.shape[0]), restricted_area):
            if not is_intruder:
                intruders += 1
                new_person_tracker[person_id] = (bbox, features, frames_tracked, True)
                intruder_hash = hashlib.md5(f"{center_x},{center_y}".encode()).hexdigest()[:8]
                last_intruder_hash = intruder_hash
            frame_intruders.add(person_id)

    current_intruders = len(frame_intruders)
    person_tracker = new_person_tracker

    # Draw bounding boxes and labels
    for person_id, (bbox, _, _, is_intruder) in person_tracker.items():
        color = (0, 0, 255) if is_intruder else (0, 255, 0)
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
        if is_intruder:
            cv2.putText(frame, f"Intruder: {person_id}", (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

    processing_time = (time.time() - start_time) * 1000
    processing_times.append(processing_time)
    avg_processing_time = np.mean(processing_times)
    inference_fps = 1000 / avg_processing_time

    cv2.putText(frame, f"Inference time: {avg_processing_time:.1f}ms ({inference_fps:.1f} FPS)", 
                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)

    cv2.putText(frame, f"Detected persons: {detected_persons}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(frame, f"Total intruders: {intruders}", (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(frame, f"Current intruders: {current_intruders}", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)
    if last_intruder_hash:
        cv2.putText(frame, f"Last intruder hash: {last_intruder_hash}", (10, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 2, cv2.LINE_AA)

    return cv2.imencode('.jpg', frame)

def gen_frames_with_source():
    global fps, vs
    last_time = time.time()
    frame_count = 0

    while True:
        if(vs is None):
            continue

        frame,success = vs.read()
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

@app.route('/video_feed')
def video_feed():
    global vs, line_points
    video_source = request.args.get('source', default="")
    if not video_source:
        video_source = RTSP_URL
    
    print(f"Starting feed with video_source: {video_source}")

    x1 = int(request.args.get('x', default=0))
    y1 = int(request.args.get('y', default=0))
    w = int(request.args.get('w', default=0))
    h = int(request.args.get('h', default=0))

    print(f"Bounding Box coordinates: x1={x1}, y1={y1}, w={w}, h={h}")

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

    return Response(gen_frames_with_source(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG, threaded=True)