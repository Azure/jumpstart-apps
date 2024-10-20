import time
import collections
import cv2
import numpy as np
import threading
from queue import Queue
from openvino.runtime import Core
import hashlib
from scipy.spatial.distance import cosine
from collections import defaultdict
from video_capture import VideoCapture
import os

class VideoProcessor:
    def __init__(self, url, index, name, debug=False, x1=0, y1=0, w=0, h=0):
        self.url = url
        self.index = index
        self.processed_frame_queue = Queue(maxsize=10)
        self.vs = None
        self.fps = 0
        self.name = name
        self.line_points = [
            (int(x1), int(y1)), 
            (int(x1) + int(w), int(y1)), 
            (int(x1) + int(w), int(y1) + int(h)), 
            (int(x1), int(y1) + int(h)), 
            (int(x1), int(y1))
        ]
        self.process_thread = None
        self.running = False
        self.last_activity = time.time()
        self.inactivity_threshold = 30  # 30 seconds
        self.debug = debug

        # OpenVINO setup
        MODEL_PATH = os.getenv("MODEL_PATH", "C:\\Users\\fcabrera\\Downloads\\jumpstart-apps\\models")
        self.ie = Core()
        self.det_model = self.ie.read_model(os.path.join(MODEL_PATH, "person-detection-retail-0013.xml"))
        self.det_compiled_model = self.ie.compile_model(model=self.det_model, device_name="CPU")
        self.reid_model = self.ie.read_model(os.path.join(MODEL_PATH, "person-reidentification-retail-0287.xml"))
        self.reid_compiled_model = self.ie.compile_model(model=self.reid_model, device_name="GPU" if "GPU" in self.ie.available_devices else "CPU")

        # Get input and output layers
        self.det_input_layer = self.det_compiled_model.input(0)
        self.det_output_layer = self.det_compiled_model.output(0)
        self.reid_input_layer = self.reid_compiled_model.input(0)
        self.reid_output_layer = self.reid_compiled_model.output(0)

        # Get input sizes
        self.det_height, self.det_width = list(self.det_input_layer.shape)[2:]
        self.reid_height, self.reid_width = list(self.reid_input_layer.shape)[2:]

        # Person tracking variables
        self.person_tracker = {}
        self.next_person_id = 0
        self.max_frames_to_track = 60
        self.max_distance_threshold = 0.3
        self.min_detection_confidence = 0.6

        # Counting variables
        self.detected_persons = 0
        self.intruders = 0
        self.last_intruder_hash = None
        self.current_intruders = 0

        # Area tracking
        self.people_near_areas = defaultdict(lambda: defaultdict(dict))
        self.area_stats = defaultdict(lambda: {"current_count": 0, "total_count": 0})

    def start(self):
        if not self.running:
            self.running = True
            self.vs = VideoCapture(self.url)
            self.process_thread = threading.Thread(target=self.process_frames)
            self.process_thread.start()
            print(f"Started processing thread for video {self.index}")
    
    def stop(self):
        self.running = False
        if self.process_thread:
            self.process_thread.join()
        if self.vs:
            self.vs.stop()
        print(f"Stopped processing thread for video {self.index}")

    def extract_features(self, frame, bbox):
        x1, y1, x2, y2 = bbox
        person_image = frame[y1:y2, x1:x2]
        person_image = cv2.resize(person_image, (self.reid_width, self.reid_height))
        person_image = np.expand_dims(person_image.transpose(2, 0, 1), 0)
        return self.reid_compiled_model([person_image])[self.reid_output_layer].flatten()

    def update_area_presence(self, person_hash, bbox, frame_shape, current_time, is_new=False):
        center = ((bbox[0] + bbox[2]) // 2 / frame_shape[1], (bbox[1] + bbox[3]) // 2 / frame_shape[0])
        
        for i, area in enumerate([self.line_points]):  # Assuming line_points defines the restricted area
            if self.point_in_polygon(center, area):
                if is_new or i not in self.people_near_areas[person_hash]:
                    self.people_near_areas[person_hash][i] = {"start_time": current_time, "end_time": current_time}
                    self.area_stats[i]["current_count"] += 1
                    self.area_stats[i]["total_count"] += 1
                else:
                    self.people_near_areas[person_hash][i]["end_time"] = current_time

    def update_area_exit(self, person_hash, current_time):
        for area_id in self.people_near_areas[person_hash]:
            self.people_near_areas[person_hash][area_id]["end_time"] = current_time
            self.area_stats[area_id]["current_count"] -= 1
        del self.people_near_areas[person_hash]

    def point_in_polygon(self, point, polygon):
        x, y = point
        odd_nodes = False
        j = len(polygon) - 1
        for i in range(len(polygon)):
            xi, yi = polygon[i][0], polygon[i][1]
            xj, yj = polygon[j][0], polygon[j][1]
            if yi < y and yj >= y or yj < y and yi >= y:
                if xi + (y - yi) / (yj - yi) * (xj - xi) < x:
                    odd_nodes = not odd_nodes
            j = i
        return odd_nodes

    def process_frames(self):
        processing_times = collections.deque(maxlen=200)
        frame_count = 0
        last_time = time.time()
        while self.running:
            frame, success = self.vs.read()
            if not success:
                continue

            frame_count += 1
            current_time = time.time()
            if current_time - last_time >= 1:
                self.fps = frame_count / (current_time - last_time)
                frame_count = 0
                last_time = current_time

            if self.debug:
                cv2.putText(frame, f"FPS: {self.fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 1, cv2.LINE_AA)

            start_time = time.time()

            resized_frame = cv2.resize(frame, (self.det_width, self.det_height))
            input_frame = np.expand_dims(resized_frame.transpose(2, 0, 1), 0)
            
            detections = self.det_compiled_model([input_frame])[self.det_output_layer][0][0]
            
            self.detected_persons = 0
            current_frame_detections = []

            for detection in detections:
                if detection[2] > self.min_detection_confidence:
                    self.detected_persons += 1
                    bbox = [int(detection[i] * dim) for i, dim in zip([3, 4, 5, 6], [frame.shape[1], frame.shape[0]] * 2)]
                    features = self.extract_features(frame, bbox)
                    current_frame_detections.append((bbox, features))

            new_person_tracker = {}
            for person_id, (last_bbox, last_features, frames_tracked, is_intruder, person_hash) in self.person_tracker.items():
                best_match = min(
                    ((i, cosine(last_features, features)) for i, (_, features) in enumerate(current_frame_detections)),
                    key=lambda x: x[1],
                    default=(None, float('inf'))
                )
                
                if best_match[0] is not None and best_match[1] < self.max_distance_threshold:
                    bbox, features = current_frame_detections.pop(best_match[0])
                    new_person_tracker[person_id] = (bbox, features, frames_tracked + 1, is_intruder, person_hash)
                    self.update_area_presence(person_hash, bbox, frame.shape, current_time)
                elif frames_tracked < self.max_frames_to_track:
                    new_person_tracker[person_id] = (last_bbox, last_features, frames_tracked + 1, is_intruder, person_hash)
                else:
                    self.update_area_exit(person_hash, current_time)

            for bbox, features in current_frame_detections:
                person_hash = hashlib.md5(features.tobytes()).hexdigest()[:8]
                new_person_tracker[self.next_person_id] = (bbox, features, 1, False, person_hash)
                self.update_area_presence(person_hash, bbox, frame.shape, current_time, is_new=True)
                self.next_person_id += 1

            frame_intruders = set()
            for person_id, (bbox, features, frames_tracked, is_intruder, person_hash) in new_person_tracker.items():
                center = ((bbox[0] + bbox[2]) // 2 / frame.shape[1], (bbox[1] + bbox[3]) // 2 / frame.shape[0])
                
                if self.point_in_polygon(center, self.line_points):
                    if not is_intruder:
                        self.intruders += 1
                        new_person_tracker[person_id] = (bbox, features, frames_tracked, True, person_hash)
                        self.last_intruder_hash = person_hash
                    frame_intruders.add(person_id)

            self.current_intruders = len(frame_intruders)
            self.person_tracker = new_person_tracker

            for person_id, (bbox, _, _, is_intruder, person_hash) in self.person_tracker.items():
                color = (0, 0, 255) if is_intruder else (0, 255, 0)
                cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
                cv2.putText(frame, f"ID: {person_hash}", (bbox[0], bbox[1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

            cv2.polylines(frame, [np.array(self.line_points, np.int32).reshape((-1, 1, 2))], True, (255, 0, 0), 2)
            cv2.putText(frame, f"Area: {self.area_stats[0]['current_count']}", 
                        (self.line_points[0][0], self.line_points[0][1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

            processing_time = (time.time() - start_time) * 1000
            processing_times.append(processing_time)
            avg_processing_time = np.mean(processing_times)
            inference_fps = 1000 / avg_processing_time

            if self.debug:
                cv2.putText(frame, f"Inference time: {avg_processing_time:.1f}ms ({inference_fps:.1f} FPS)", 
                            (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 1, cv2.LINE_AA)

            if not self.processed_frame_queue.full():
                self.processed_frame_queue.put(frame)

            if time.time() - self.last_activity > self.inactivity_threshold:
                if self.debug:
                    print(f"Video {self.index} inactive for {self.inactivity_threshold} seconds. Stopping thread.")
                self.stop()
                break

    def update_line(self, x1, y1, w, h):
        frame, _ = self.vs.read()
        if frame is not None:
            height, width = frame.shape[:2]
            scaling_factor_x = width / 640
            scaling_factor_y = height / 360

            x1 = int(float(x1) * scaling_factor_x)
            y1 = int(float(y1) * scaling_factor_y)
            w = int(float(w) * scaling_factor_x)
            h = int(float(h) * scaling_factor_y)

            self.line_points = [
                (x1, y1), (x1 + w, y1), (x1 + w, y1 + h), (x1, y1 + h), (x1, y1)
            ]
        return "Line updated successfully"

    def get_frame(self):
        self.last_activity = time.time()
        if not self.running:
            self.start()
        return self.processed_frame_queue.get() if not self.processed_frame_queue.empty() else None
    
    def get_detection_data(self):
        return {
            "detected_persons": self.detected_persons,
            "total_intruders": self.intruders,
            "current_intruders": self.current_intruders,
            "last_intruder_hash": self.last_intruder_hash,
            "area_stats": dict(self.area_stats),
            "people_near_areas": {k: {int(area_id): v for area_id, v in areas.items()} 
                                for k, areas in self.people_near_areas.items()}
        }