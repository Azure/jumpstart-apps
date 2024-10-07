let canvas;
let ctx;
let videoCanvas;
let videoCtx;
let restrictedArea = null;
let isDragging = false;
let isResizing = false;
let startX, startY;
let resizeHandle = '';
let socket;

function log(message) {
    const consoleWindow = document.getElementById('console-window');
    consoleWindow.innerHTML += `${new Date().toLocaleTimeString()} - ${message}<br>`;
    consoleWindow.scrollTop = consoleWindow.scrollHeight;
}

document.addEventListener('DOMContentLoaded', (event) => {
    log("Application initialized");
    initializeCanvas();
    initializeWebSocket();
});

function initializeCanvas() {
    log("Initializing canvas");
    videoCanvas = document.getElementById('video-feed');
    videoCtx = videoCanvas.getContext('2d');
    canvas = document.getElementById('overlay-canvas');
    ctx = canvas.getContext('2d');

    if (!videoCanvas || !canvas) {
        log("Error: Video feed or overlay canvas not found");
        return;
    }

    videoCanvas.width = canvas.width = 640;  // Set to your desired width
    videoCanvas.height = canvas.height = 480;  // Set to your desired height

    log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);

    canvas.addEventListener('mousedown', startInteraction);
    canvas.addEventListener('mousemove', handleInteraction);
    canvas.addEventListener('mouseup', stopInteraction);

    if (restrictedArea) {
        drawRestrictedArea();
    }
}

function initializeWebSocket() {
    socket = io();

    socket.on('connect', () => {
        log('WebSocket connected');
    });

    socket.on('new_frame', (data) => {
        updateVideoFeed(data.image);
    });

    socket.on('detection_data', (data) => {
        updateDetectionDisplay(data);
    });
}

function updateVideoFeed(imageData) {
    const img = new Image();
    img.onload = () => {
        videoCtx.drawImage(img, 0, 0, videoCanvas.width, videoCanvas.height);
    };
    img.src = 'data:image/jpeg;base64,' + imageData;
}

// ... (keep the rest of the functions from the previous main.js)

function setRtspUrl() {
    log("Setting RTSP URL");
    const url = document.getElementById('rtsp-url').value;
    fetch('/set_rtsp_url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
    })
    .then(response => response.json())
    .then(data => {
        log('RTSP URL set successfully');
    })
    .catch((error) => {
        log('Error setting RTSP URL: ' + error);
    });
}

function updateDetectionDisplay(data) {
    const detectionInfo = document.getElementById('detection-info');
    detectionInfo.innerHTML = `
        <p><strong>Detected Persons:</strong> ${data.detected_persons}</p>
        <p><strong>Intruders:</strong> ${data.intruders}</p>
        <p><strong>Last Intruder Hash:</strong> ${data.last_intruder_hash || 'None'}</p>
    `;
    log(`Updated detection data: ${data.detected_persons} persons, ${data.intruders} intruders`);
}