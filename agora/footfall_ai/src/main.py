from flask import Flask, render_template, Response
import cv2
from flask import request
import gc
import os

from CountsPerSec import CountsPerSec
from VideoGet import VideoGet
from VideoInference import VideoInference
import time

app = Flask(__name__)
gc.collect()

video_getter = None
video_inference = VideoInference().start()
cps = CountsPerSec().start()

def putIterationsPerSec(frame, iterations_per_sec):
    """
    Add iterations per second text to lower-left corner of a frame.
    """

    cv2.putText(frame, "{:.0f} iterations/sec".format(iterations_per_sec),
        (10, 450), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255))
    return frame

def gen_frames_with_source():
    
    while True:
        if video_getter.stopped:
            print("Stopping video getter")
            video_getter.stop()
            break

        if video_inference.stopped:
            print("Stopping video inference")
            video_inference.stop()
            break

        frame = video_getter.frame
        video_inference.frame = frame
        #frame = putIterationsPerSec(frame, cps.countsPerSec())
        inferenced_frame = video_inference.inferenced_frame
        if(inferenced_frame is None):
            continue
        
        ui_bytes = inferenced_frame.tobytes()
        cps.increment()
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + ui_bytes + b'\r\n')

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/shopper")
def shopper():
    return render_template('shopper/landing2.html')

@app.route('/video_feed')
def video_feed():
    video_source = request.args.get('source', default="")
    x1 = int(request.args.get('x', default=0))
    y1 = int(request.args.get('y', default=0))
    w = int(request.args.get('w', default=0))
    h = int(request.args.get('h', default=0))

    global video_getter

    if video_getter is not None:        
        video_getter.stop()

    video_getter = VideoGet(video_source).start()
    video_inference.update_region(x1, y1, w, h)

    return Response(gen_frames_with_source(),
            mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True, threaded=True)