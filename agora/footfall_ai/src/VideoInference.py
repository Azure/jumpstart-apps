from threading import Thread
import cv2
from ultralytics import YOLO
import os
from ultralytics.solutions import ObjectCounter
import collections
import time
import os
import numpy as np

class VideoInference:
    """
    Class that continuously shows a frame using a dedicated thread.
    """
    def __init__(self, frame=None):
        self.frame = frame
        self.inferenced_frame = frame
        self.stopped = False
        self.det_model = YOLO("C:\\Users\\fcabrera\\Downloads\\jumpstart-apps\\agora\\footfall_ai\\src\\models\\yolov8n.pt")
        self.device_value = os.getenv("DEVICE_VALUE", "AUTO")

        self.x1 = 0
        self.y1 = 0
        self.w = 0
        self.h = 0
        self.line_points = [(self.x1, self.y1), 
                            (self.x1 + self.w, self.y1), (self.x1 + self.w, self.y1 + self.h),
                             (self.x1, self.y1 + self.h), 
                             (self.x1, self.y1)]  # line or region points
        self.classes_to_count = [0]  # person is class 0 in the COCO dataset
        self.counter = ObjectCounter(
            view_img=False, reg_pts=self.line_points, classes_names=self.det_model.names, 
            draw_tracks=True, line_thickness=2, view_in_counts=False, view_out_counts=False
        )

    def start(self):
        Thread(target=self.inference, args=()).start()
        return self

    def inference(self):
        last_saved_time = time.time()
        while not self.stopped:

            if(self.frame is None):
                continue

            if(self.x1 == 0 and self.y1 == 0 and self.w == 0 and self.h == 0):
                # Encode the frame as a JPG image
                success, self.inferenced_frame = cv2.imencode('.jpg', self.frame)
                continue
               
            # Processing time
            processing_times = collections.deque(maxlen=200)
            selfCounter = 0
            start_time = time.time()

            tracks = self.det_model.track(self.frame, persist=True, classes=self.classes_to_count, verbose=False)
            frame = self.counter.start_counting(self.frame, tracks)
            stop_time = time.time()

            processing_times.append(stop_time - start_time)

            # Mean processing time [ms].
            _, f_width = frame.shape[:2]
            processing_time = np.mean(processing_times) * 1000
            fps = 1000 / processing_time
            cv2.putText(
                img=self.frame,
                text=f"Inference time: {processing_time:.1f}ms ({fps:.1f} FPS)",
                org=(20, 40),
                fontFace=cv2.FONT_HERSHEY_COMPLEX,
                fontScale=f_width / 1000,
                color=(0, 0, 255),
                thickness=2,
                lineType=cv2.LINE_AA,
            )
            print(f"Inference time: {processing_time:.1f}ms ({fps:.1f} FPS)")
            
            # Get the counts. Counts are getting as 'OUT'
            # Modify this logic accordingly
            counts = self.counter.out_counts

            # Define the text to display
            text = f"Current count: {counts}"
            fontFace = cv2.FONT_HERSHEY_COMPLEX
            fontScale = 0.75  # Adjust scale as needed
            thickness = 2

            # Calculate the size of the text box
            (text_width, text_height), _ = cv2.getTextSize(text, fontFace, fontScale, thickness)

            # Define the upper right corner for the text
            top_right_corner = (frame.shape[1] - text_width - 20, 40)
            # Draw the count of "OUT" on the frame
            cv2.putText(
                img=self.frame,
                text=text,
                org=(top_right_corner[0], top_right_corner[1]),
                fontFace=fontFace,
                fontScale=fontScale,
                color=(0, 0, 255),
                thickness=thickness,
                lineType=cv2.LINE_AA,
            )

            # Encode the frame as a JPG image
            success, self.inferenced_frame = cv2.imencode('.jpg', self.frame)

    def stop(self):
        self.stopped = True

    def update_region(self, aux_x1, aux_y1, aux_x2, aux_y2):
        if aux_x1 != self.x1 or aux_y1 != self.y1 or aux_x2 != self.w or aux_y2 != self.h:
            self.x1, self.y1, self.w, self.h = aux_x1, aux_y1, aux_x2, aux_y2
            self.stopped = False
            self.line_points = [
                (self.x1, self.y1), 
                (self.x1 + self.w, self.y1), 
                (self.x1 + self.w, self.y1 + self.h), 
                (self.x1, self.y1 + self.h), 
                (self.x1, self.y1)
            ]
            self.counter = ObjectCounter(
                view_img=False, 
                reg_pts=self.line_points, 
                classes_names=self.det_model.names, 
                draw_tracks=True, 
                line_thickness=2, 
                view_in_counts=False, 
                view_out_counts=False
            )