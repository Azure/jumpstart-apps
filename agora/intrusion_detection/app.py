import os
from flask import Flask, render_template, Response, request, jsonify
import cv2
import numpy as np
from openvino.runtime import Core
import hashlib
import threading
import queue
from scipy.spatial.distance import cosine

app = Flask(__name__)

# Global variables
rtsp_url = ""
restricted_area = []
ie = Core()
detected_persons = 0
intruders = 0
last_intruder_hash = None
current_intruders = 0

# Thread-safe queue for frames
frame_queue = queue.Queue(maxsize=10)

# Load the person detection model
det_model_xml = "person-detection-retail-0013.xml"
det_model_bin = "person-detection-retail-0013.bin"
det_model = ie.read_model(model=det_model_xml)
det_compiled_model = ie.compile_model(model=det_model, device_name="CPU")

# Load the person re-identification model
reid_model_xml = "person-reidentification-retail-0287.xml"
reid_model_bin = "person-reidentification-retail-0287.bin"
reid_model = ie.read_model(model=reid_model_xml)
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

def extract_features(frame, bbox):
    x1, y1, x2, y2 = bbox
    person_image = frame[y1:y2, x1:x2]
    person_image = cv2.resize(person_image, (reid_width, reid_height))
    person_image = np.transpose(person_image, (2, 0, 1))
    person_image = np.expand_dims(person_image, axis=0)
    features = reid_compiled_model([person_image])[reid_output_layer]
    return features.flatten()

def process_frame(frame):
    global detected_persons, intruders, last_intruder_hash, person_tracker, next_person_id, current_intruders
    
    # Preprocess the frame for person detection
    resized_frame = cv2.resize(frame, (det_width, det_height))
    input_frame = np.expand_dims(resized_frame.transpose(2, 0, 1), 0)
    
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
            cv2.putText(frame, f"Intruder: {person_id}", (bbox[0], bbox[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

    return frame

def capture_frames():
    global rtsp_url
    while True:
        if rtsp_url:
            cap = cv2.VideoCapture(rtsp_url)
            while cap.isOpened():
                success, frame = cap.read()
                if not success:
                    break
                if not frame_queue.full():
                    frame_queue.put(frame)
            cap.release()
        else:
            import time
            time.sleep(1)

def generate_frames():
    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()
            frame = process_frame(frame)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_restricted_area', methods=['POST'])
def set_restricted_area():
    global restricted_area
    restricted_area = request.json['area']
    return jsonify({"message": "Restricted area set successfully"}), 200

@app.route('/set_rtsp_url', methods=['POST'])
def set_rtsp_url():
    global rtsp_url
    rtsp_url = request.json['url']
    return jsonify({"message": "RTSP URL set successfully"}), 200

@app.route('/get_detection_data')
def get_detection_data():
    global detected_persons, intruders, last_intruder_hash, current_intruders
    return jsonify({
        "detected_persons": detected_persons,
        "total_intruders": intruders,
        "current_intruders": current_intruders,
        "last_intruder_hash": last_intruder_hash
    })

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

if __name__ == '__main__':
    # Start the frame capture thread
    capture_thread = threading.Thread(target=capture_frames, daemon=True)
    capture_thread.start()

    # Run the Flask app
    app.run(debug=True, threaded=True)