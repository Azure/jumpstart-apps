import os
from flask import Flask, render_template, Response, request, jsonify
import cv2
import numpy as np
from openvino.runtime import Core, get_version as ov_get_version
import hashlib
import threading
import queue
from scipy.spatial.distance import cosine
import time
from collections import defaultdict
# from video_capture import VideoCapture

# Constants
#MODEL_PATH = os.getenv("MODEL_PATH", "./models/")
MODEL_PATH = os.getenv("MODEL_PATH", "C:\\Users\\fcabrera\\Downloads\\models\\")
RTSP_URL = os.getenv("RTSP_URL", "rtsp://rtsp_stream_container:554/stream")
FRAME_RATE = 25
CLASSES_TO_COUNT = [0]  # person is class 0 in the COCO dataset
FLASK_PORT = int(os.getenv("FLASK_PORT", 5001))
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ["true", "1", "t"]

app = Flask(__name__)

# Global variables
video_source = "your_video_file.mp4"
restricted_areas = []
ie = Core()
detected_persons = 0
intruders = 0
last_intruder_hash = None
current_intruders = 0

# Thread-safe queue for frames
frame_queue = queue.Queue(maxsize=10)

# Load models
det_model = ie.read_model("person-detection-retail-0013.xml")
det_compiled_model = ie.compile_model(model=det_model, device_name="CPU")
reid_model = ie.read_model("person-reidentification-retail-0287.xml")
reid_compiled_model = ie.compile_model(model=reid_model, device_name="GPU" if "GPU" in ie.available_devices else "CPU")

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
max_frames_to_track = 60
max_distance_threshold = 0.3
min_detection_confidence = 0.6

# New variables for tracking people near detection areas
people_near_areas = defaultdict(lambda: defaultdict(dict))
area_stats = defaultdict(lambda: {"current_count": 0, "total_count": 0})

def extract_features(frame, bbox):
    """Extract features from a person's bounding box using the re-identification model."""
    x1, y1, x2, y2 = bbox
    person_image = frame[y1:y2, x1:x2]
    person_image = cv2.resize(person_image, (reid_width, reid_height))
    person_image = np.expand_dims(person_image.transpose(2, 0, 1), 0)
    return reid_compiled_model([person_image])[reid_output_layer].flatten()

def process_video():
    global detected_persons, intruders, last_intruder_hash, person_tracker, next_person_id, current_intruders, video_source
    
    cap = cv2.VideoCapture(video_source)
    fps = cap.get(cv2.CAP_PROP_FPS)
    process_every_n_frames = max(1, int(fps / 10))  # Process 10 frames per second
    frame_count = 0
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
        
        frame_count += 1
        if frame_count % process_every_n_frames != 0:
            continue
        
        current_time = time.time()
        
        resized_frame = cv2.resize(frame, (det_width, det_height))
        input_frame = np.expand_dims(resized_frame.transpose(2, 0, 1), 0)
        
        detections = det_compiled_model([input_frame])[det_output_layer][0][0]
        
        detected_persons = 0
        current_frame_detections = []

        for detection in detections:
            if detection[2] > min_detection_confidence:
                detected_persons += 1
                bbox = [int(detection[i] * dim) for i, dim in zip([3, 4, 5, 6], [frame.shape[1], frame.shape[0]] * 2)]
                features = extract_features(frame, bbox)
                current_frame_detections.append((bbox, features))

        new_person_tracker = {}
        for person_id, (last_bbox, last_features, frames_tracked, is_intruder, person_hash) in person_tracker.items():
            best_match = min(
                ((i, cosine(last_features, features)) for i, (_, features) in enumerate(current_frame_detections)),
                key=lambda x: x[1],
                default=(None, float('inf'))
            )
            
            if best_match[0] is not None and best_match[1] < max_distance_threshold:
                bbox, features = current_frame_detections.pop(best_match[0])
                new_person_tracker[person_id] = (bbox, features, frames_tracked + 1, is_intruder, person_hash)
                update_area_presence(person_hash, bbox, frame.shape, current_time)
            elif frames_tracked < max_frames_to_track:
                new_person_tracker[person_id] = (last_bbox, last_features, frames_tracked + 1, is_intruder, person_hash)
            else:
                update_area_exit(person_hash, current_time)

        for bbox, features in current_frame_detections:
            person_hash = hashlib.md5(features.tobytes()).hexdigest()[:8]
            new_person_tracker[next_person_id] = (bbox, features, 1, False, person_hash)
            update_area_presence(person_hash, bbox, frame.shape, current_time, is_new=True)
            next_person_id += 1

        frame_intruders = set()
        for person_id, (bbox, features, frames_tracked, is_intruder, person_hash) in new_person_tracker.items():
            center = ((bbox[0] + bbox[2]) // 2 / frame.shape[1], (bbox[1] + bbox[3]) // 2 / frame.shape[0])
            
            for area in restricted_areas:
                if point_in_polygon(center, area['area']):
                    if not is_intruder:
                        intruders += 1
                        new_person_tracker[person_id] = (bbox, features, frames_tracked, True, person_hash)
                        last_intruder_hash = person_hash
                    frame_intruders.add(person_id)
                    break

        current_intruders = len(frame_intruders)
        person_tracker = new_person_tracker

        for person_id, (bbox, _, _, is_intruder, person_hash) in person_tracker.items():
            color = (0, 0, 255) if is_intruder else (0, 255, 0)
            cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
            cv2.putText(frame, f"ID: {person_hash}", (bbox[0], bbox[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

        for i, area in enumerate(restricted_areas):
            points = np.array([(p['x'] * frame.shape[1], p['y'] * frame.shape[0]) for p in area['area']], np.int32)
            cv2.polylines(frame, [points.reshape((-1, 1, 2))], True, (255, 0, 0), 2)
            cv2.putText(frame, f"Area {i}: {area_stats[i]['current_count']}", 
                        (int(points[0][0]), int(points[0][1]) - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

        if not frame_queue.full():
            frame_queue.put(frame)

    cap.release()

def update_area_presence(person_hash, bbox, frame_shape, current_time, is_new=False):
    """Update the presence of a person near detection areas."""
    center = ((bbox[0] + bbox[2]) // 2 / frame_shape[1], (bbox[1] + bbox[3]) // 2 / frame_shape[0])
    
    for i, area in enumerate(restricted_areas):
        if point_in_polygon(center, area['area']):
            if is_new or i not in people_near_areas[person_hash]:
                people_near_areas[person_hash][i] = {"start_time": current_time, "end_time": current_time}
                area_stats[i]["current_count"] += 1
                area_stats[i]["total_count"] += 1
            else:
                people_near_areas[person_hash][i]["end_time"] = current_time

def update_area_exit(person_hash, current_time):
    """Update statistics when a person exits all areas."""
    for area_id in people_near_areas[person_hash]:
        people_near_areas[person_hash][area_id]["end_time"] = current_time
        area_stats[area_id]["current_count"] -= 1
    del people_near_areas[person_hash]

def generate_frames():
    while True:
        if not frame_queue.empty():
            frame = frame_queue.get()
            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/video_feed')
def video_feed():
    global vs, line_points
#    video_source = request.args.get('source', default="")
#    if not video_source:
#        video_source = RTSP_URL
    
    print(f"Starting feed with video_source: {video_source}")

    x1 = int(request.args.get('x', default=0))
    y1 = int(request.args.get('y', default=0))
    w = int(request.args.get('w', default=0))
    h = int(request.args.get('h', default=0))

    print(f"Bounding Box coordinates: x1={x1}, y1={y1}, w={w}, h={h}")

  #  vs = cv2.VideoCapture(video_source)
  #  frame = vs.read()[0]
  #  if frame is not None:
  #      height, width = frame.shape[:2]
  #      scaling_factor_x = width / 640
  #      scaling_factor_y = height / 360

  #      x1 = int(x1 * scaling_factor_x)
  #      y1 = int(y1 * scaling_factor_y)
  #      w = int(w * scaling_factor_x)
  #      h = int(h * scaling_factor_y)

  #      line_points = [
  #          (x1, y1), (x1 + w, y1), (x1 + w, y1 + h), (x1, y1 + h), (x1, y1)
  #      ]

    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')



@app.route('/set_restricted_areas', methods=['POST'])
def set_restricted_areas():
    global restricted_areas
    restricted_areas = request.json['areas']
    return jsonify({"message": "Restricted areas set successfully"}), 200

@app.route('/set_video_source', methods=['POST'])
def set_video_source():
    global video_source
    video_source = request.json['url']
    return jsonify({"message": "Video source set successfully"}), 200

@app.route('/get_detection_data')
def get_detection_data():
    global detected_persons, intruders, last_intruder_hash, current_intruders
    return jsonify({
        "detected_persons": detected_persons,
        "total_intruders": intruders,
        "current_intruders": current_intruders,
        "last_intruder_hash": last_intruder_hash,
        "area_stats": dict(area_stats),
        "people_near_areas": {k: {int(area_id): v for area_id, v in areas.items()} 
                              for k, areas in people_near_areas.items()}
    })

def point_in_polygon(point, polygon):
    """Check if a point is inside a polygon."""
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
    print(f"OpenVINO version: {ov_get_version()}")
    print(f"Available devices: {ie.available_devices}")
    
    video_thread = threading.Thread(target=process_video, daemon=True)
    video_thread.start()
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=FLASK_DEBUG, threaded=True)