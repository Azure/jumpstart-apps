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
from datetime import datetime
from PIL import Image
from ultralytics import YOLO
import torch

class VideoProcessor:
    def __init__(self, url, index, name, skip_fps, debug=False, enable_saving=True):
        self.url = url
        self.index = index
        self.processed_frame_queue = Queue(maxsize=10)
        self.vs = None
        self.name = name
        self.restricted_areas = []
        self.process_thread = None
        self.running = False

        self.enable_saving = enable_saving  # Flag to enable/disable saving frames and videos
        self.debug = debug
        self.skip_fps = skip_fps

        MODEL_PATH = os.getenv("MODEL_PATH", ".\\models")
        print(f"Model: {MODEL_PATH}")

        # Initialize YOLO model
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")
        
        yolo_model_path = os.path.join(MODEL_PATH, "yolov8n.pt")
        self.model = YOLO(yolo_model_path, task='detect').to(device)
        self.min_confidence = 0.6
        print(f"Model loaded on: {next(self.model.parameters()).device}")

        # Initialize OpenVINO age detection
        self.initialize_age_detection(os.path.join(MODEL_PATH, "age-gender-recognition-retail-0013.xml"))

        # Initialize save_lock for thread-safe operations
        self.save_lock = threading.Lock()

        # Directory to store person images
        self.person_image_dir = "/usr/src/app/detected_frames"
        if not os.path.exists(self.person_image_dir):
            os.makedirs(self.person_image_dir)
        
        # Directory to store GIFs
        self.videos_output_dir = "/usr/src/app/detected_persons/videos"
        if not os.path.exists(self.videos_output_dir):
            os.makedirs(self.videos_output_dir)
        
        self.processed_person_dirs = set()
        self.video_creation_thread = None

        # Initialize tracking and statistics
        self.restricted_areas = []
        self.area_stats = {}
        self.age_stats = collections.defaultdict(int)
        self.people_near_areas = {}
        
        # Performance monitoring
        self.fps = 0
        self.processing_times = collections.deque(maxlen=200)
        self.detected_persons = 0
        self.current_shoppers = 0
        self.shoppers = 0
        
        # Thread control
        self.processed_frame_queue = Queue(maxsize=32)
        self.last_activity = time.time()
        self.inactivity_threshold = 60

        # Age tracking
        self.age_stats = defaultdict(int)
        for age_group in range(10, 60, 10):
            self.age_stats[age_group] = 0

    #------------------------------
    # Region for Nodel Initialization 
    #------------------------------
    def initialize_age_detection(self, age_model_path):
        """
        Initialize OpenVINO age detection model.
        """
        core = Core()
        self.age_model = core.read_model(age_model_path)
        self.age_compiled_model = core.compile_model(self.age_model)
        
        # Get input and output details
        self.age_input_layer = self.age_compiled_model.input(0)
        self.age_output_layer = self.age_compiled_model.output(0)
        
        # Get model shape information
        self.age_height, self.age_width = 224, 224  # Default size for most age detection models
        if len(self.age_input_layer.shape) == 4:
            _, _, self.age_height, self.age_width = self.age_input_layer.shape

    
    #------------------------------
    # Region for Thead methods  
    #------------------------------
    def start(self):
        if not self.running:
            self.running = True
            self.vs = VideoCapture(self.url, self.skip_fps)
            self.process_thread = threading.Thread(target=self.process_frames)
            self.process_thread.start()
            print(f"Started processing thread for video {self.index}")

            if self.enable_saving:
                if self.video_creation_thread is None or not self.video_creation_thread.is_alive():
                    self.video_creation_thread = threading.Thread(target=self.video_creation_worker)
                    self.video_creation_thread.daemon = True
                    self.video_creation_thread.start()
                    print(f"Started video creation thread for video {self.index}")

    def stop(self):
        self.running = False
        self.fps = 0
        if self.vs:
            self.vs.stop()

        if self.enable_saving and self.video_creation_thread:
            self.video_creation_thread.join()
        
        if self.process_thread:
            if threading.current_thread() != self.process_thread:
                self.process_thread.join()
        print(f"Stopped processing thread for video {self.name}")


    #------------------------------
    # Region for Get/Set methods  
    #------------------------------
    def update_area_presence(self, person_hash, age, bbox, frame_shape, current_time, is_new=False):
        """
        Update presence information for a person in restricted areas.
        """
        center = ((bbox[0] + bbox[2]) / 2 / frame_shape[1],
                 (bbox[1] + bbox[3]) / 2 / frame_shape[0])
                 
        for i, area in enumerate(self.restricted_areas):
            if self.point_in_rectangle(center, area):
                if person_hash not in self.people_near_areas:
                    self.people_near_areas[person_hash] = {}
                    
                if i not in self.people_near_areas[person_hash]:
                    self.people_near_areas[person_hash][i] = {
                        "start_time": current_time,
                        "end_time": current_time,
                        "age": age
                    }
                    self.area_stats[i]["current_count"] += 1
                    self.area_stats[i]["total_count"] += 1
                else:
                    self.people_near_areas[person_hash][i]["end_time"] = current_time
                    self.people_near_areas[person_hash][i]["age"] = age

    def update_age_stats(self, person_hash, age):
        """
        Update age statistics for tracked persons.
        """
        age_group = int(age // 10) * 10
        if person_hash not in self.age_stats:
            self.age_stats[age_group] += 1
            self.age_stats[person_hash] = age_group
        else:
            previous_age_group = self.age_stats[person_hash]
            if previous_age_group != age_group:
                self.age_stats[previous_age_group] -= 1
                self.age_stats[age_group] += 1
                self.age_stats[person_hash] = age_group

    def update_debug(self, debug):
        self.debug = debug
 
    def set_restricted_area(self, areas):
        """
        Set restricted areas for monitoring.
        """
        self.restricted_areas = []
        self.area_stats = {i: {"current_count": 0, "total_count": 0} for i in range(len(areas))}
        if areas:
            for area in areas:
                if 'id' in area and 'area' in area:
                    aux_area = area['area'] 
                    x_coords = [point['x'] for point in aux_area]
                    y_coords = [point['y'] for point in aux_area]
                    
                    x1, y1 = min(x_coords), min(y_coords)
                    x2, y2 = max(x_coords), max(y_coords)
                    self.restricted_areas.append([float(x1), float(y1), float(x2), float(y2)])
                else:
                    return "Error: Invalid area format. Each area must have an 'id' and 'area' key"
        return "Restricted areas set successfully"

    def remove_restricted_area(self, area_id):
        if 0 <= area_id < len(self.restricted_areas):
            del self.restricted_areas[area_id]
            return f"Restricted area {area_id} removed successfully"
        else:
            return f"Invalid area ID: {area_id}"


    #------------------------------
    # Region for Frame Proecessing 
    #------------------------------
    def extract_age(self, frame, bbox):
        """
        Extract age from detected person using OpenVINO model.
        """
        try:
            x1, y1, x2, y2 = bbox
            person_image = frame[y1:y2, x1:x2]
            person_image = cv2.resize(person_image, (self.age_width, self.age_height))
            person_image = np.expand_dims(person_image.transpose(2, 0, 1), 0)
            outputs = self.age_compiled_model([person_image])
            age = int(outputs[self.age_output_layer][0][0] * 100)
            return age
        except Exception as e:
            print(f"Age extraction error: {e}")
            return 0
            

    def extract_features(self, detection):
        """
        Generate a simple feature vector using bounding box coordinates and confidence score.
        """
        # Extract bounding box coordinates and confidence from the detection
        x1, y1, x2, y2, confidence, class_id = detection

        # Use the bounding box and confidence as feature representation
        # Here, we're combining them into a single feature vector
        feature_vector = [x1, y1, x2, y2, confidence]

        # Convert to numpy array for consistency with original feature extraction
        return np.array(feature_vector)

    @staticmethod
    def point_in_rectangle(point, rectangle):
        """
        Check if a point is inside a rectangle.
        """
        x, y = point
        x1, y1, x2, y2 = rectangle
        return x1 <= x <= x2 and y1 <= y <= y2

    def draw_restricted_areas(self, frame):
        """
        Draw restricted areas and their statistics on the frame.
        """
        for i, area in enumerate(self.restricted_areas):
            x1, y1 = int(area[0] * frame.shape[1]), int(area[1] * frame.shape[0])
            x2, y2 = int(area[2] * frame.shape[1]), int(area[3] * frame.shape[0])
            
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f"Area {i}: {self.area_stats[i]['current_count']}", 
                       (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    
    def draw_debug_info(self, frame, avg_processing_time, inference_fps):
        """
        Draw debug information on the frame.
        """
        cv2.putText(frame, f"FPS: {self.fps:.2f}", 
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 1, cv2.LINE_AA)
        cv2.putText(frame, f"Inference time: {avg_processing_time:.1f}ms ({inference_fps:.1f} FPS)", 
                    (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 1, cv2.LINE_AA)
        
    def process_frames(self):
        """
        Main processing loop with YOLOv8 tracking and age detection.
        """
        frame_count = 0
        last_time = time.time()
        
        while self.running:
            frame, success = self.vs.read()
            if not success:
                continue

            # FPS calculation
            frame_count += 1
            current_time = time.time()
            if current_time - last_time >= 1:
                self.fps = frame_count / (current_time - last_time)
                frame_count = 0
                last_time = current_time

            start_time = time.time()

            # Run YOLOv8 detection with tracking
            results = self.model.track(
                frame,
                persist=True,
                classes=[0],  # Only track persons
                conf=self.min_confidence,
            )[0]

            # Process tracked objects
            if results.boxes.id is not None:
                boxes = results.boxes.xywh.cpu()  # Get boxes in xywh format
                track_ids = results.boxes.id.cpu().numpy()
                confidences = results.boxes.conf.cpu().numpy()

                self.detected_persons = len(track_ids)
                
                # Process each detection
                for box, track_id, conf in zip(boxes, track_ids, confidences):
                    x, y, w, h = box
                    track_id = int(track_id)
                    
                    # Convert to bbox format
                    bbox = [
                        int(x - w/2), int(y - h/2),  # x1, y1
                        int(x + w/2), int(y + h/2)   # x2, y2
                    ]
                    
                    # Generate unique hash for person
                    person_hash = hashlib.md5(f"{track_id}".encode()).hexdigest()[:8]
                    
                    # Extract and update age
                    age = self.extract_age(frame, bbox)
                    self.update_age_stats(person_hash, age)
                    
                    # Update area presence if any areas are set
                    if self.restricted_areas and len(self.restricted_areas) > 0:
                        self.update_area_presence(person_hash, age, bbox, frame.shape, current_time)
                    
                    # Draw bounding box and information
                    color = (0, 255, 0)
                    cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
                    cv2.putText(frame, f"ID: {person_hash} Age: {age}", 
                              (bbox[0], bbox[1] - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # Draw restricted areas if any areas are set
            if self.restricted_areas and len(self.restricted_areas) > 0:
                self.draw_restricted_areas(frame)

            # Calculate and display performance metrics
            processing_time = (time.time() - start_time) * 1000
            self.processing_times.append(processing_time)
            avg_processing_time = np.mean(self.processing_times)
            inference_fps = 1000 / avg_processing_time

            if self.debug:
                self.draw_debug_info(frame, avg_processing_time, inference_fps)
                cv2.putText(frame, f"FPS: {self.fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 1, cv2.LINE_AA)

            # Queue the processed frame
            if not self.processed_frame_queue.full():
                self.processed_frame_queue.put(frame)

            # Check for inactivity
            if time.time() - self.last_activity > self.inactivity_threshold:
                if self.debug:
                    print(f"Inactive for {self.inactivity_threshold} seconds. Stopping.")
                self.stop()
                break

    def get_frame(self):
        self.last_activity = time.time()
        if not self.running:
            self.start()
        return self.processed_frame_queue.get() if not self.processed_frame_queue.empty() else None
    

    #------------------------------
    # Region for ACSA sync methods  
    #------------------------------
    def create_video(self, image_folder, person_dir):
        images = [img for img in os.listdir(image_folder) if img.lower().endswith(('.jpg', '.jpeg', '.png'))]
        images.sort()

        if len(images) < 5:
            print(f"Not enough images in {image_folder} to create a video. Skipping.")
            return

        try:
            resample_filter = Image.Resampling.LANCZOS
        except AttributeError:
            resample_filter = Image.LANCZOS

        frames = []
        desired_size = (200, 400)

        for img_name in images:
            img_path = os.path.join(image_folder, img_name)
            with Image.open(img_path) as img:
                img = img.convert('RGB')
                img.thumbnail(desired_size, resample=resample_filter)
                new_frame = Image.new('RGB', desired_size, (255, 255, 255))
                paste_position = ((desired_size[0] - img.size[0]) // 2, (desired_size[1] - img.size[1]) // 2)
                new_frame.paste(img, paste_position)
                frame = cv2.cvtColor(np.array(new_frame), cv2.COLOR_RGB2BGR)
                frames.append(frame)

        if not os.path.exists(self.videos_output_dir):
            os.makedirs(self.videos_output_dir)

        output_filename = f"{person_dir}.mp4"
        output_path = os.path.join(self.videos_output_dir, output_filename)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        fps = 10
        out = cv2.VideoWriter(output_path, fourcc, fps, desired_size)

        for frame in frames:
            out.write(frame)

        out.release()
        print(f"Video saved as {output_path}")

    def video_creation_worker(self):
        while self.running and self.enable_saving:
            time.sleep(60)
            person_dirs = [d for d in os.listdir(self.person_image_dir) if os.path.isdir(os.path.join(self.person_image_dir, d))]
            for person_dir in person_dirs:
                if person_dir not in self.processed_person_dirs:
                    full_person_dir = os.path.join(self.person_image_dir, person_dir)
                    num_images = len([img for img in os.listdir(full_person_dir) if img.lower().endswith(('.jpg', '.jpeg', '.png'))])
                    if num_images >= 5:
                        self.create_video(full_person_dir, person_dir)
                        self.processed_person_dirs.add(person_dir)
                    else:
                        print(f"Directory {full_person_dir} has less than 5 frames. Skipping video creation.")

    def save_detected_person(self, frame, bbox, person_id):
        if not self.enable_saving:
            return
        with self.save_lock:
            x1, y1, x2, y2 = bbox
            bbox_width = x2 - x1
            bbox_height = y2 - y1
            expansion_factor = 0.2
            x1_expanded = max(0, int(x1 - bbox_width * expansion_factor))
            y1_expanded = max(0, int(y1 - bbox_height * expansion_factor))
            x2_expanded = min(frame.shape[1], int(x2 + bbox_width * expansion_factor))
            y2_expanded = min(frame.shape[0], int(y2 + bbox_height * expansion_factor))
            person_image = frame[y1_expanded:y2_expanded, x1_expanded:x2_expanded]
            person_dir = os.path.join(self.person_image_dir, f"person_{person_id}")
            if not os.path.exists(person_dir):
                os.makedirs(person_dir)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S%f")
            filename = f"{timestamp}.jpg"
            filepath = os.path.join(person_dir, filename)
            cv2.imwrite(filepath, person_image)


    #-------------------------
    # Region for API methods  
    #------------------------
    def get_detection_data(self):
        return {
            "detected_persons": self.detected_persons,
            "total_shoppers": self.shoppers,
            "current_shopper": self.current_shoppers,
            "area_stats": dict(self.area_stats),
            "fps": self.fps,
            "people_near_areas": {k: {int(area_id): v for area_id, v in areas.items()} 
                      for k, areas in self.people_near_areas.items()},
            "age_stats": {age: count for age, count in self.age_stats.items() if isinstance(age, int)},
            "areas" : self.restricted_areas,
            "running": self.running
        }
