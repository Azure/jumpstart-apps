import os
from flask import Flask, render_template, Response, request, jsonify
import cv2
from openvino.runtime import Core, get_version as ov_get_version
from video_processor import VideoProcessor
import time
import json
from prometheus_metrics import PrometheusMetrics
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

# Constants
FLASK_PORT = int(os.getenv("FLASK_PORT", 5001))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ["true", "1", "t"]
PROCESSOR_SKIP_FPS = int(os.getenv("PROCESSOR_SKIP_FPS", 2))

# Read ENABLE_SAVING environment variable
ENABLE_SAVING = os.getenv("ENABLE_SAVING", "True").lower() in ["true", "1", "t"]

app = Flask(__name__)

# Global variables
video_processors = {}
ie = Core()

def get_or_create_processor(camera_name, data):
    if camera_name not in video_processors:
        index = len(camera_name)
        debug = bool(data['debug'])
        video_url = data['video_url']
        video_processors[camera_name] = VideoProcessor(video_url, index, camera_name, PROCESSOR_SKIP_FPS, debug,enable_saving=ENABLE_SAVING)
        if(data.get('areas', None)):
            video_processors[camera_name].set_restricted_area(data['areas'])
    else:
        video_processors[camera_name].update_debug(bool(data['debug']))
        if 'areas' in data:
            print(f"Restricted areas for {camera_name}: {data['areas']}")
            
        if(data.get('areas', None)):
            video_processors[camera_name].set_restricted_area(data['areas'])
    return video_processors[camera_name]

def generate(data, camera_name):
    processor = get_or_create_processor(camera_name, data)
    print(f"Starting video feed for {camera_name}")
    while True:
        frame = processor.get_frame()
        if frame is not None:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        else:
            time.sleep(0.01)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    json_str = request.args.get('data')
    if json_str is None:
        return "Missing 'data' parameter in URL", 400
    try:
        data = json.loads(json_str)
    except ValueError:
        return "Invalid JSON format", 400
    
    camera_name = data["cameraName"]       
    return Response(generate(data, camera_name), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_restricted_areas', methods=['POST'])
def set_restricted_areas():
    data = request.json
    areas = data.get('areas', [])
    camera_name = data.get('cameraName')
    if camera_name == "":
        return jsonify({"message": "Video processor not started"}), 200
    
    processor = get_or_create_processor(camera_name, data)
    if processor:
        return jsonify({"message": "Restricted areas set successfully"}), 200
    else:
        return jsonify({"error": "Video processor not found"}), 404

@app.route('/set_video_source', methods=['POST'])
def set_video_source():
    data = request.json   
    camera_name = data.get('cameraName')
    get_or_create_processor(camera_name, data)
    print(f"Video source set to {camera_name}")
    return jsonify({"message": "Video source set successfully"}), 200

@app.route('/status')
def status():
    camera_name = request.args.get('camera_name', default="")
    if camera_name:
        processor = video_processors.get(camera_name)
        if processor:
            data = processor.get_detection_data()
            return jsonify(data)
        else:
            return jsonify({"message": "Video processor not found"}), 404
    else:
        all_processors_data = {url: processor.get_detection_data() for url, processor in video_processors.items()}
        return jsonify(all_processors_data)

def get_all_cameras_data_func():
    results = {}
    for video_url, processor in video_processors.items():
        results[video_url] = processor.get_detection_data()
    return results

@app.route('/metrics')
def metrics():
    # Get current detection data for all cameras
    all_camera_data = get_all_cameras_data_func()
    
    # Update all metrics
    prometheus_metrics.update_metrics(all_camera_data)
    
    # Generate and return the metrics in Prometheus format
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)

if __name__ == '__main__':
    print(f"OpenVINO version: {ov_get_version()}")
    print(f"Available devices: {ie.available_devices}")  
    
    # Initialize the metrics
    prometheus_metrics = PrometheusMetrics()
    
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG, threaded=True)
