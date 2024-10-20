import os
from flask import Flask, render_template, Response, request, jsonify
import cv2
from openvino.runtime import Core, get_version as ov_get_version
from video_processor import VideoProcessor
import time
import json

# Constants
FLASK_PORT = int(os.getenv("FLASK_PORT", 5001))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ["true", "1", "t"]

app = Flask(__name__)

# Global variables
video_processors = {}
ie = Core()

def get_or_create_processor(video_url, data):
    if video_url not in video_processors:
        index = len(video_processors)
        debug = bool(data.get('debug', 'False'))
        name = data['cameraName']
        if 'cameraName' not in data:
            name = f"camera_{index}"
        else:
            name = data['cameraName']
        video_processors[video_url] = VideoProcessor(video_url, index, name, debug)

        if(data.get('areas', None)):
            video_processors[video_url].set_restricted_area(data['areas'])

    return video_processors[video_url]

def generate(data, video_url):
    processor = get_or_create_processor(video_url, data)
    print(f"Starting video feed for {video_url}")
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

@app.route('/video_feed/<path:video_url>')
def video_feed(video_url):
    json_str = request.args.get('data')
    print(f"Received data: {json_str}")
    if json_str is None:
        return "Missing 'data' parameter in URL", 400
    try:
        data = json.loads(json_str)
    except ValueError:
        return "Invalid JSON format", 400
    return Response(generate(data, video_url),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_restricted_areas', methods=['POST'])
def set_restricted_areas():
    data = request.json
    areas = data.get('areas', [])
    video_url = data.get('video_url', "")
    if video_url == "":
        return jsonify({"message": "Video processor not started"}), 200
    
    processor = get_or_create_processor(video_url, None)
    if processor:
        # Assume the first area is the one we want to set
        if areas:
            processor.set_restricted_area(areas)
            return jsonify({"message": "Restricted areas set successfully"}), 200
        else:
            return jsonify({"error": "Invalid area format"}), 400
    else:
        return jsonify({"error": "Video processor not found"}), 404

@app.route('/set_video_source', methods=['POST'])
def set_video_source():
    data = request.json   
    video_source = data.get('url')
    get_or_create_processor(video_source, data)
    print(f"Video source set to {video_source}")
    return jsonify({"message": "Video source set successfully"}), 200

@app.route('/status')
def status():
    video_url = request.args.get('video_url', default="")
    if video_url == "":
        return jsonify({"message": "Video processor not started"}), 200
    
    processor = get_or_create_processor(video_url, None)
    if processor:
        return jsonify(processor.get_detection_data())
    else:
        return jsonify({"message": "Video processor not started or not found"}), 200

if __name__ == '__main__':
    print(f"OpenVINO version: {ov_get_version()}")
    print(f"Available devices: {ie.available_devices}")
    
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG, threaded=True)