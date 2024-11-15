import time
import collections
import cv2
import numpy as np
from queue import Queue
import threading
from ultralytics.solutions import ObjectCounter
from video_capture import VideoCapture

class VideoProcessor:
    def __init__(self, url, index, model, name, skip_fps, debug=False, x1=0, y1=0, w=0, h=0, ):
        self.url = url
        self.index = index
        self.processed_frame_queue = Queue(maxsize=10)
        self.vs = None
        self.fps = 0
        self.counter = None
        self.name = name
        self.skip_fps = skip_fps
        self.line_points = [
            (int(x1), int(y1)), 
            (int(x1) + int(w), int(y1)), 
            (int(x1) + int(w), int(y1) + int(h)), 
            (int(x1), int(y1) + int(h)), 
            (int(x1), int(y1))
        ]
        self.process_thread = None
        self.running = False
        self.model = model
        self.classes_to_count = [0]  # person is class 0 in the COCO dataset
        self.last_activity = time.time()
        self.inactivity_threshold = 30  # 30 seconds
        self.debug = debug
        self.last_reset = time.time()

        if any(point != (0, 0) for point in self.line_points):
            self.initialize_counter()

    def initialize_counter(self):
        self.counter = ObjectCounter(
            view_img=False,
            reg_pts=self.line_points,
            names=self.model.names,
            draw_tracks=self.debug,
            line_thickness=1 if self.debug else 0,
            view_in_counts=self.debug,
            view_out_counts=self.debug
        )
        self.last_reset = time.time()

    def update_debug(self, debug):
        self.debug = debug 

    def get_current_count(self):
        if self.counter is None:
            return 0
        return self.counter.out_counts
    
    def get_line_points(self):
        return self.line_points
    
    def get_fps(self):
        return int(self.fps)
    
    def get_debug(self):
        return self.debug
    
    def get_name(self):
        return self.name
    
    def get_video_url(self):
        return self.url

    def start(self):
        if not self.running:
            self.running = True
            self.vs = VideoCapture(self.url, self.skip_fps, queue_size=150)
            self.process_thread = threading.Thread(target=self.process_frames)
            self.process_thread.start()
            print(f"Started processing thread for video {self.index}")

    def stop(self):
        self.running = False
        self.fps = 0
        if self.vs:
            self.vs.stop()

        if self.enable_saving and self.video_creation_thread:
            self.video_creation_thread.join()
            
        print(f"Stopped processing thread for video {self.name}")

    def process_frames(self):
        processing_times = collections.deque(maxlen=200)
        frame_count = 0
        last_time = time.time()
        while self.running:
            frame, success = self.vs.read()
            original_frame = frame.copy()
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

            if all(point == (0, 0) for point in self.line_points):
                processed_frame = frame
            else:
                start_time = time.time()
                tracks = self.model.track(frame, persist=True, classes=self.classes_to_count, verbose=False)

                # Rese to avoid keeping history
                if time.time() - self.last_reset > 5:
                    self.initialize_counter()

                processed_frame = self.counter.start_counting(frame, tracks)

                processing_time = (time.time() - start_time) * 1000
                processing_times.append(processing_time)
                avg_processing_time = np.mean(processing_times)
                inference_fps = 1000 / avg_processing_time

                if self.debug:
                    cv2.putText(processed_frame, f"Inference time: {avg_processing_time:.1f}ms ({inference_fps:.1f} FPS)", 
                                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 0), 1, cv2.LINE_AA)

            if not self.processed_frame_queue.full():
                if self.debug:
                    self.processed_frame_queue.put(frame)
                else:
                    self.processed_frame_queue.put(original_frame)

            # Check for inactivity
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
            self.initialize_counter()
        return "Line updated successfully"

    def get_frame(self):
        self.last_activity = time.time()
        if not self.running:
            self.start()
        return self.processed_frame_queue.get() if not self.processed_frame_queue.empty() else None