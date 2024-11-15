import os
import time
import cv2
from flask import Flask, render_template, Response, request
from flask_cors import CORS
from ultralytics import YOLO
import torch
import json
from video_processor import VideoProcessor

# Constants
MODEL_PATH = os.getenv("MODEL_PATH", "./models/yolov8n.pt")
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ["true", "1", "t"]
PROCESSOR_SKIP_FPS = int(os.getenv("PROCESSOR_SKIP_FPS", 2))

# Initialize Flask app
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT"]}})

# Global variables
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
det_model = YOLO(MODEL_PATH).to(device)

print(f"Model: {MODEL_PATH}")
print(f"Using device: {device}")
print(f"Model loaded on: {next(det_model.model.parameters()).device}")

video_processors = {}

def get_or_create_processor(camera_name, data):
    if camera_name not in video_processors:
        index = len(camera_name)
        x1, y1, w, h = data['x'], data['y'], data['w'], data['h']
        debug = bool(data['debug'])
        video_url = data['video_url']
        video_processors[camera_name] = VideoProcessor(video_url, index, det_model, camera_name, PROCESSOR_SKIP_FPS, debug, x1, y1, w, h)
    else:
        video_processors[camera_name].update_debug(bool(data['debug']))
        video_processors[camera_name].update_line(data['x'], data['y'], data['w'], data['h'])
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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/status', methods=['GET'])
def status():
    all_status = []
    for camera_name, processor in video_processors.items():
        status_info = {
            "name": camera_name,
            "video_url": processor.get_video_url(),
            "current_count": processor.get_current_count(),
            "line_points": processor.get_line_points(),
            "fps": processor.get_fps(),
            "debug": processor.get_debug(),
            "timestamp": int(time.time())
        }
        all_status.append(status_info)
    return {"statuses": all_status}, 200

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG, threaded=True)
    finally:
        for processor in video_processors.values():
            processor.stop()