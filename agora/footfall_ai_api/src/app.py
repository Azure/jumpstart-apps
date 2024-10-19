import os
import time
import cv2
from flask import Flask, render_template, Response, request
from ultralytics import YOLO
import torch
from video_processor import VideoProcessor

# Constants
MODEL_PATH = os.getenv("MODEL_PATH", "./models/yolov8n.pt")
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ["true", "1", "t"]

# Initialize Flask app
app = Flask(__name__)

# Global variables
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
det_model = YOLO(MODEL_PATH).to(device)

print(f"Using device: {device}")
print(f"Model loaded on: {next(det_model.model.parameters()).device}")

video_processors = {}

def get_or_create_processor(video_url):
    if video_url not in video_processors:
        index = len(video_processors)
        video_processors[video_url] = VideoProcessor(video_url, index, det_model)
    return video_processors[video_url]

@app.route('/video_feed/<path:video_url>')
def video_feed(video_url):
    def generate():
        processor = get_or_create_processor(video_url)
        while True:
            frame = processor.get_frame()
            if frame is not None:
                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            else:
                time.sleep(0.01)

    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/update_line/<path:video_url>', methods=['POST'])
def update_line(video_url):
    processor = get_or_create_processor(video_url)
    data = request.json
    x1, y1, w, h = data['x'], data['y'], data['w'], data['h']
    
    result = processor.update_line(x1, y1, w, h)
    return result, 200

@app.route('/status', methods=['GET'])
def status():
    all_status = []
    for video_url, processor in video_processors.items():
        status_info = {
            "video_url": video_url,
            "current_count": processor.get_current_count(),
            "line_points": processor.get_line_points()
        }
        all_status.append(status_info)
    return {"statuses": all_status}, 200

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG, threaded=True)
    finally:
        for processor in video_processors.values():
            processor.stop()