import os
import time
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
import cv2
import numpy as np
from openvino.runtime import Core
import hashlib
from threading import Thread, Lock
from flask_socketio import SocketIO
import base64

app = Flask(__name__, static_url_path='/static')
socketio = SocketIO(app)
logging.basicConfig(level=logging.DEBUG)

# Global variables
rtsp_url = "rtsp://localhost:8554/cam"  # Default local RTSP simulator URL
restricted_area = []
ie = Core()
detected_persons = 0
intruders = 0
last_intruder_hash = None
frame_lock = Lock()
current_frame = None
processing = False

# Load the model
model_xml = "person-detection-retail-0013.xml"
model_bin = "person-detection-retail-0013.bin"
model = ie.read_model(model=model_xml)
compiled_model = ie.compile_model(model=model, device_name="CPU")

# Get input and output layers
input_layer = compiled_model.input(0)
output_layer = compiled_model.output(0)

# Get input size
height, width = list(input_layer.shape)[2:]

def process_frame(frame):
    global detected_persons, intruders, last_intruder_hash
    
    # Preprocess the frame
    resized_frame = cv2.resize(frame, (width, height))
    input_frame = np.expand_dims(resized_frame.transpose(2, 0, 1), 0)
    
    # Perform inference
    results = compiled_model([input_frame])[output_layer]
    
    detected_persons = 0
    frame_intruders = 0
    for detection in results[0][0]:
        if detection[2] > 0.5:  # Confidence threshold
            detected_persons += 1
            xmin = int(detection[3] * frame.shape[1])
            ymin = int(detection[4] * frame.shape[0])
            xmax = int(detection[5] * frame.shape[1])
            ymax = int(detection[6] * frame.shape[0])
            cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
            
            center_x = (xmin + xmax) // 2
            center_y = (ymin + ymax) // 2
            if point_in_polygon((center_x, center_y), restricted_area):
                frame_intruders += 1
                intruder_hash = hashlib.md5(f"{center_x},{center_y}".encode()).hexdigest()[:8]
                last_intruder_hash = intruder_hash
                cv2.putText(frame, f"Intruder: {intruder_hash}", (xmin, ymin - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    
    intruders += frame_intruders
    return frame

def capture_frames():
    global current_frame, processing, rtsp_url
    app.logger.info(f"Starting capture from {rtsp_url}")
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        app.logger.error(f"Failed to open video capture for {rtsp_url}")
        return

    while processing:
        success, frame = cap.read()
        if not success:
            app.logger.warning(f"Failed to read frame from {rtsp_url}")
            time.sleep(1)  # Wait a bit before trying again
            continue
        
        processed_frame = process_frame(frame)
        
        with frame_lock:
            current_frame = processed_frame
        
        # Encode and send the frame via WebSocket
        _, buffer = cv2.imencode('.jpg', processed_frame)
        encoded_frame = base64.b64encode(buffer).decode('utf-8')
        socketio.emit('new_frame', {'image': encoded_frame})
        
        # Send detection data
        socketio.emit('detection_data', {
            "detected_persons": detected_persons,
            "intruders": intruders,
            "last_intruder_hash": last_intruder_hash
        })
        
        time.sleep(0.033)  # Limit to about 30 FPS
    
    cap.release()
    app.logger.info("Frame capture stopped.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set_restricted_area', methods=['POST'])
def set_restricted_area():
    global restricted_area
    restricted_area = request.json['area']
    return jsonify({"message": "Restricted area set successfully"}), 200

@app.route('/set_rtsp_url', methods=['POST'])
def set_rtsp_url():
    global rtsp_url, processing
    new_url = request.json['url']
    
    app.logger.info(f"Setting new RTSP URL: {new_url}")
    
    if rtsp_url != new_url:
        rtsp_url = new_url
        if processing:
            processing = False
            time.sleep(1)  # Give time for the previous thread to stop
        processing = True
        Thread(target=capture_frames, daemon=True).start()
    
    return jsonify({"message": "RTSP URL set successfully"}), 200

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

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
    socketio.run(app, debug=True)