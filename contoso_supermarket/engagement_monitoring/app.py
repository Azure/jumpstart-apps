from openvino.runtime import Core
import os
import cv2
import time
import numpy as np
from flask import Flask, render_template, Response

app = Flask(__name__)

script_dir = os.path.dirname(os.path.abspath(__file__))

# Model paths
model_xml = os.path.join(script_dir, 'models', 'person-detection-retail-0013.xml')
model_bin = os.path.join(script_dir, 'models', 'person-detection-retail-0013.bin')

# Video path
video_path = os.path.join(script_dir, 'videos', 'supermarket.mp4')

# Initialize OpenVINO Runtime
core = Core()
model = core.read_model(model=model_xml, weights=model_bin)
compiled_model = core.compile_model(model=model, device_name="CPU")

# Get input and output node names
input_blob = next(iter(compiled_model.inputs))
output_blob = next(iter(compiled_model.outputs))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(get_frame(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/people_count')
def people_count():
    global person_count
    return str(person_count)

def get_frame():
    """Generate frames from the video and perform inference."""
    global person_count
    cap = cv2.VideoCapture(video_path)
    while cap.isOpened():
        frame_count = 0
        total_fps = 0

        # Read frame from video
        ret, frame = cap.read()
        if not ret:
            break  # Break if end of video

        start_time = time.time()

        # Preprocess frame for input to OpenVINO model
        input_shape = input_blob.shape
        resized_frame = cv2.resize(frame, (input_shape[3], input_shape[2]))
        preprocessed_frame = resized_frame.transpose((2, 0, 1))  # Change data layout from HWC to CHW
        preprocessed_frame = preprocessed_frame.reshape(1, *preprocessed_frame.shape)

        # Perform inference
        output = compiled_model([preprocessed_frame])
        inference_time = time.time() - start_time

        # Process the output and draw bounding boxes
        boxes = output[output_blob][0][0]
        person_count = 0

        heatmap = np.zeros((frame.shape[0], frame.shape[1]), dtype=np.float32)

        for box in boxes:
            if box[2] > 0.5:  # Confidence threshold
                person_count += 1
                x1, y1, x2, y2 = box[3], box[4], box[5], box[6]
                cv2.rectangle(frame, (int(x1 * frame.shape[1]), int(y1 * frame.shape[0])),
                              (int(x2 * frame.shape[1]), int(y2 * frame.shape[0])), (0, 255, 0), 2)
                
                xmin, xmax = int(x1 * frame.shape[1]), int(x2 * frame.shape[1])
                ymin, ymax = int(y1 * frame.shape[0]), int(y2 * frame.shape[0])
                heatmap[ymin:ymax, xmin:xmax] += 1

        # Normalize and apply heatmap color
        heatmap = cv2.normalize(heatmap, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        # Overlay heatmap on the original frame
        alpha = 0.5
        cv2.addWeighted(heatmap, alpha, frame, 1 - alpha, 0, frame)

        # FPS calculation
        end_time = time.time()
        fps = 1 / (end_time - start_time)
        total_fps += fps
        frame_count += 1

        # Encode frame to JPEG for streaming
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        # Yield the frame to the video stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=True, debug=True)