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
from PIL import ImageOps

class VideoProcessor:
    def __init__(self, url, index, name, skip_fps, debug=False, enable_saving=True):
        self.url = url
        self.index = index
        self.processed_frame_queue = Queue(maxsize=10)
        self.vs = None
        self.fps = 0
        self.name = name
        self.restricted_areas = []
        self.process_thread = None
        self.running = False
        self.last_activity = time.time()
        self.inactivity_threshold = 30  # 30 seconds
        self.enable_saving = enable_saving  # Flag to enable/disable saving frames and videos
        self.debug = debug
        self.skip_fps = skip_fps

        # Initialize save_lock for thread-safe operations
        self.save_lock = threading.Lock()

        # Directory to store person images
        #MNT PATH FOR ACSA SHOULD BE SET TO /app/detected_persons
        self.person_image_dir = "/usr/src/app/detected_frames"
        if not os.path.exists(self.person_image_dir):
            os.makedirs(self.person_image_dir)
        
        # Directory to store GIFs
        self.videos_output_dir = "/usr/src/app/detected_persons/videos"
        if not os.path.exists(self.videos_output_dir):
            os.makedirs(self.videos_output_dir)
        
        # Keep track of processed person directories
        self.processed_person_dirs = set()
        
        # Start the Video creation thread
        self.video_creation_thread = None

        # OpenVINO setup
        MODEL_PATH = os.getenv("MODEL_PATH", ".\\models")
        self.ie = Core()
        self.det_model = self.ie.read_model(os.path.join(MODEL_PATH, "person-detection-retail-0013.xml"))
        self.det_compiled_model = self.ie.compile_model(model=self.det_model, device_name="CPU")
        self.reid_model = self.ie.read_model(os.path.join(MODEL_PATH, "person-reidentification-retail-0287.xml"))
        self.reid_compiled_model = self.ie.compile_model(model=self.reid_model, device_name="GPU" if "GPU" in self.ie.available_devices else "CPU")
        self.age_compiled_model = self.ie.read_model(os.path.join(MODEL_PATH, "age-gender-recognition-retail-0013.xml"))
        self.age_compiled_model = self.ie.compile_model(model=self.age_compiled_model, device_name="GPU" if "GPU" in self.ie.available_devices else "CPU")

        # Print model loading information
        device_used = "GPU" if "GPU" in self.ie.available_devices else "CPU"
        print(f"Model loaded in: {device_used}")

       # Get input and output layers
        self.det_input_layer = self.det_compiled_model.input(0)
        self.det_output_layer = self.det_compiled_model.output(0)
        self.reid_input_layer = self.reid_compiled_model.input(0)
        self.reid_output_layer = self.reid_compiled_model.output(0)
        self.age_input_layer = self.age_compiled_model.input(0)
        self.age_output_layer = self.age_compiled_model.output(1)

        # Get input sizes
        self.det_height, self.det_width = list(self.det_input_layer.shape)[2:]
        self.reid_height, self.reid_width = list(self.reid_input_layer.shape)[2:]
        self.age_height, self.age_width = list(self.age_input_layer.shape)[2:]

        # Person tracking variables
        self.person_tracker = {}
        self.next_person_id = 0
        self.person_videos = {}
        self.max_frames_to_track = 60
        self.max_distance_threshold = 0.3
        self.min_detection_confidence = 0.6

        # Counting variables
        self.detected_persons = 0
        self.shoppers = 0
        self.last_shopper_hash = None
        self.current_shoppers = 0

        # Area tracking
        self.people_near_areas = defaultdict(lambda: defaultdict(dict))
        self.area_stats = defaultdict(lambda: {"current_count": 0, "total_count": 0})

        # Age tracking
        self.age_stats = defaultdict(int)
        # Initialize age groups
        for age_group in range(10, 60, 10):
            self.age_stats[age_group] = 0

    def start(self):
        if not self.running:
            self.running = True
            self.vs = VideoCapture(self.url, self.skip_fps)
            self.process_thread = threading.Thread(target=self.process_frames)
            self.process_thread.start()
            print(f"Started processing thread for video {self.index}")

              # Start the video creation thread
            if self.enable_saving:
                # Start the video creation thread
                if self.video_creation_thread is None or not self.video_creation_thread.is_alive():
                    self.video_creation_thread = threading.Thread(target=self.video_creation_worker)
                    self.video_creation_thread.daemon = True  # Daemon thread exits when main thread exits
                    self.video_creation_thread.start()
                    print(f"Started video creation thread for video {self.index}")
    
    def stop(self):
        self.running = False
        if self.process_thread:
            self.process_thread.join()
        if self.enable_saving and self.video_creation_thread:
            self.video_creation_thread.join()
        if self.vs:
            self.vs.stop()
        print(f"Stopped processing thread for video {self.index}")

    def extract_features(self, frame, bbox):
        x1, y1, x2, y2 = bbox
        person_image = frame[y1:y2, x1:x2]
        person_image = cv2.resize(person_image, (self.reid_width, self.reid_height))
        person_image = np.expand_dims(person_image.transpose(2, 0, 1), 0)
        return self.reid_compiled_model([person_image])[self.reid_output_layer].flatten()

    def extract_age(self, frame, bbox):
        x1, y1, x2, y2 = bbox
        person_image = frame[y1:y2, x1:x2]
        person_image = cv2.resize(person_image, (self.age_width, self.age_height))
        person_image = np.expand_dims(person_image.transpose(2, 0, 1), 0)
        outputs = self.age_compiled_model([person_image])
        age = int(outputs[self.age_output_layer][0] * 100)
        return age

    def update_area_presence(self, person_hash, age,  bbox, frame_shape, current_time, is_new=False):
        center = ((bbox[0] + bbox[2]) // 2 / frame_shape[1], (bbox[1] + bbox[3]) // 2 / frame_shape[0])
        
        for i, area in enumerate(self.restricted_areas):
            if self.point_in_rectangle(center, area):
                if is_new or i not in self.people_near_areas[person_hash]:
                    self.people_near_areas[person_hash][i] = {"start_time": current_time, "end_time": current_time, "age": age}
                    self.area_stats[i]["current_count"] += 1
                    self.area_stats[i]["total_count"] += 1
                else:
                    self.people_near_areas[person_hash][i]["end_time"] = current_time

    def update_area_exit(self, person_hash, current_time):
        for area_id in self.people_near_areas[person_hash]:
            self.people_near_areas[person_hash][area_id]["end_time"] = current_time
            self.area_stats[area_id]["current_count"] -= 1
        del self.people_near_areas[person_hash]

    def update_age_stats(self, person_hash, age):
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

    def point_in_rectangle(self, point, rectangle):
        x, y = point
        x1, y1, x2, y2 = rectangle
        return x1 <= x <= x2 and y1 <= y <= y2

    def create_video(self, image_folder, person_dir):
        # Get list of image files in the folder
        images = [
            img for img in os.listdir(image_folder)
            if img.lower().endswith(('.jpg', '.jpeg', '.png'))
        ]

        # Sort images based on their creation time or name
        images.sort()

        # Ensure there are enough images to process
        if len(images) < 5:
            print(f"Not enough images in {image_folder} to create a video. Skipping.")
            return

        # Handle resampling filter compatibility
        try:
            resample_filter = Image.Resampling.LANCZOS  # Pillow >= 10.0.0
        except AttributeError:
            resample_filter = Image.LANCZOS  # Pillow < 10.0.0

        frames = []
        desired_size = (200, 400)  # Set desired width and height

        for img_name in images:
            img_path = os.path.join(image_folder, img_name)
            with Image.open(img_path) as img:
                img = img.convert('RGB')  # Ensure image is in RGB mode

                # Resize image while maintaining aspect ratio
                img.thumbnail(desired_size, resample=resample_filter)

                # Create a new image with a white background
                new_frame = Image.new('RGB', desired_size, (255, 255, 255))
                # Calculate position to paste the image to center it
                paste_position = (
                    (desired_size[0] - img.size[0]) // 2,
                    (desired_size[1] - img.size[1]) // 2
                )
                new_frame.paste(img, paste_position)

                # Convert to numpy array and BGR format for OpenCV
                frame = cv2.cvtColor(np.array(new_frame), cv2.COLOR_RGB2BGR)
                frames.append(frame)

        # Ensure the output directory exists
        if not os.path.exists(self.videos_output_dir):
            os.makedirs(self.videos_output_dir)

        # Define the codec and create VideoWriter object
        output_filename = f"{person_dir}.mp4"
        output_path = os.path.join(self.videos_output_dir, output_filename)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # You can use 'avc1' or 'H264' if available
        fps = 10  # Set desired frames per second
        out = cv2.VideoWriter(output_path, fourcc, fps, desired_size)

        for frame in frames:
            out.write(frame)

        out.release()
        print(f"Video saved as {output_path}")

    def video_creation_worker(self):
        while self.running and self.enable_saving:
            # Wait for 60 seconds
            time.sleep(60)
            # Get list of person directories
            person_dirs = [
                d for d in os.listdir(self.person_image_dir)
                if os.path.isdir(os.path.join(self.person_image_dir, d))
            ]
            for person_dir in person_dirs:
                if person_dir not in self.processed_person_dirs:
                    full_person_dir = os.path.join(self.person_image_dir, person_dir)
                    # Check if the person directory has at least 5 frames
                    num_images = len([
                        img for img in os.listdir(full_person_dir)
                        if img.lower().endswith(('.jpg', '.jpeg', '.png'))
                    ])
                    if num_images >= 5:
                        # Create video
                        self.create_video(full_person_dir, person_dir)
                        # Mark as processed
                        self.processed_person_dirs.add(person_dir)
                    else:
                        print(f"Directory {full_person_dir} has less than 5 frames. Skipping video creation.")

    def save_detected_person(self, frame, bbox, person_id):
        if not self.enable_saving:
            return  # Exit early if saving is disabled
        with self.save_lock:
            x1, y1, x2, y2 = bbox

            # Calculate the width and height of the bounding box
            bbox_width = x2 - x1
            bbox_height = y2 - y1

            # Define the expansion factor (e.g., 0.2 for 20%)
            expansion_factor = 0.2

            # Expand the bounding box coordinates
            x1_expanded = int(x1 - bbox_width * expansion_factor)
            y1_expanded = int(y1 - bbox_height * expansion_factor)
            x2_expanded = int(x2 + bbox_width * expansion_factor)
            y2_expanded = int(y2 + bbox_height * expansion_factor)

            # Ensure coordinates are within frame boundaries
            x1_expanded = max(0, x1_expanded)
            y1_expanded = max(0, y1_expanded)
            x2_expanded = min(frame.shape[1], x2_expanded)
            y2_expanded = min(frame.shape[0], y2_expanded)
            
            # Crop the expanded area from the frame
            person_image = frame[y1_expanded:y2_expanded, x1_expanded:x2_expanded]
            
            # Define the directory for this person
            person_dir = os.path.join(self.person_image_dir, f"person_{person_id}")
            if not os.path.exists(person_dir):
                os.makedirs(person_dir)
            
            # Use a timestamp for the image filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S%f")
            filename = f"{timestamp}.jpg"
            filepath = os.path.join(person_dir, filename)
            
            # Save the image
            cv2.imwrite(filepath, person_image)

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
                    age = self.extract_age(frame, bbox)
                    current_frame_detections.append((bbox, features, age))

            new_person_tracker = {}
            for person_id, (last_bbox, last_features, frames_tracked, is_shopper, person_hash, last_age) in self.person_tracker.items():
                best_match = min(
                    ((i, cosine(last_features, features)) for i, (_, features, _) in enumerate(current_frame_detections)),
                    key=lambda x: x[1],
                    default=(None, float('inf'))
                )

                if best_match[0] is not None and best_match[1] < self.max_distance_threshold:
                    bbox, features, age = current_frame_detections.pop(best_match[0])
                    new_person_tracker[person_id] = (bbox, features, frames_tracked + 1, is_shopper, person_hash, age)
                    self.update_area_presence(person_hash, age, bbox, frame.shape, current_time)
                    self.update_age_stats(person_hash, age)

                    # Calculate the center point of the bounding box in normalized coordinates
                    center_x = (bbox[0] + bbox[2]) / 2 / frame.shape[1]
                    center_y = (bbox[1] + bbox[3]) / 2 / frame.shape[0]
                    center = (center_x, center_y)

                    # Check if the center point is within any detection area
                    is_in_area = any(
                        self.point_in_rectangle(center, area) for area in self.restricted_areas
                    )

                    # Save the detected person image if they are in a detection area
                    if is_in_area:
                        self.save_detected_person(frame, bbox, person_id)

                elif frames_tracked < self.max_frames_to_track:
                    new_person_tracker[person_id] = (last_bbox, last_features, frames_tracked + 1, is_shopper, person_hash, last_age)
                else:
                    self.update_area_exit(person_hash, current_time)

            for bbox, features, age in current_frame_detections:
                person_hash = hashlib.md5(features.tobytes()).hexdigest()[:8]
                new_person_tracker[self.next_person_id] = (bbox, features, 1, False, person_hash, age)
                self.update_area_presence(person_hash, age, bbox, frame.shape, current_time, is_new=True)
                self.next_person_id += 1

            frame_shoppers = set()
            for person_id, (bbox, features, frames_tracked, is_shopper, person_hash, age) in new_person_tracker.items():
                center = ((bbox[0] + bbox[2]) // 2 / frame.shape[1], (bbox[1] + bbox[3]) // 2 / frame.shape[0])
                
                for area in self.restricted_areas:
                    if self.point_in_rectangle(center, area):
                        if not is_shopper:
                            self.shoppers += 1
                            new_person_tracker[person_id] = (bbox, features, frames_tracked, True, person_hash, age)
                            self.last_shopper_hash = person_hash
                        frame_shoppers.add(person_id)
                        break

            self.current_shoppers = len(frame_shoppers)
            self.person_tracker = new_person_tracker

            for person_id, (bbox, _, _, is_shopper, person_hash, age) in self.person_tracker.items():
                color = (0, 0, 255) if is_shopper else (0, 255, 0)
                cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
                cv2.putText(frame, f"ID: {person_hash} - A: {age}", (bbox[0], bbox[1] - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            for i, area in enumerate(self.restricted_areas):
                cv2.rectangle(frame, (int(area[0] * frame.shape[1]), int(area[1] * frame.shape[0])), 
                              (int(area[2] * frame.shape[1]), int(area[3] * frame.shape[0])), (255, 0, 0), 2)
                cv2.putText(frame, f"Area {i}: {self.area_stats[i]['current_count']}", 
                            (int(area[0] * frame.shape[1]), int(area[1] * frame.shape[0]) - 10),
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

    def set_restricted_area(self, areas):
        self.restricted_areas = []
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

    def get_frame(self):
        self.last_activity = time.time()
        if not self.running:
            self.start()
        return self.processed_frame_queue.get() if not self.processed_frame_queue.empty() else None
    
    def get_detection_data(self):
        return {
            "detected_persons": self.detected_persons,
            "total_shoppers": self.shoppers,
            "current_shopper": self.current_shoppers,
            "last_shopper_hash": self.last_shopper_hash,
            "area_stats": dict(self.area_stats),
            "fps": self.fps,
            "people_near_areas": {k: {int(area_id): v for area_id, v in areas.items()} 
                      for k, areas in self.people_near_areas.items()},
            "age_stats": {age: count for age, count in self.age_stats.items() if isinstance(age, int)},
            "areas" : self.restricted_areas
        }
