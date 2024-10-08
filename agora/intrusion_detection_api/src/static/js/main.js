let canvas;
let ctx;
let restrictedArea = null;
let isDragging = false;
let isResizing = false;
let startX, startY;
let resizeHandle = '';
let videoFeed;

function log(message) {
    const consoleWindow = document.getElementById('console-window');
    consoleWindow.innerHTML += `${new Date().toLocaleTimeString()} - ${message}<br>`;
    consoleWindow.scrollTop = consoleWindow.scrollHeight;
}

document.addEventListener('DOMContentLoaded', (event) => {
    log("Application initialized");
    initializeCanvas();
    setInterval(fetchDetectionData, 1000);
});

function initializeCanvas() {
    log("Initializing canvas");
    videoFeed = document.getElementById('video-feed');
    canvas = document.getElementById('overlay-canvas');

    if (!videoFeed || !canvas) {
        log("Error: Video feed or overlay canvas not found");
        return;
    }

    ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = videoFeed.offsetWidth;
        canvas.height = videoFeed.offsetHeight;
        log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
        if (restrictedArea) {
            drawRestrictedArea();
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startInteraction);
    canvas.addEventListener('mousemove', handleInteraction);
    canvas.addEventListener('mouseup', stopInteraction);

    videoFeed.addEventListener('load', () => {
        log("Video feed loaded");
        resizeCanvas();
    });
}

function toggleDrawing() {
    log("Toggle drawing clicked");
    if (restrictedArea) {
        restrictedArea = null;
        clearCanvas();
        document.getElementById('draw-button').textContent = 'Start Drawing';
        log("Restricted area cleared");
    } else {
        restrictedArea = {
            x: canvas.width * 0.25,
            y: canvas.height * 0.25,
            width: canvas.width * 0.5,
            height: canvas.height * 0.5
        };
        drawRestrictedArea();
        document.getElementById('draw-button').textContent = 'Clear Area';
        log("Default restricted area created");
    }
}

function startInteraction(e) {
    if (!restrictedArea) return;

    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    const handle = getResizeHandle(startX, startY);
    if (handle) {
        isResizing = true;
        resizeHandle = handle;
        log(`Started resizing from ${handle}`);
    } else if (isInsideRectangle(startX, startY)) {
        isDragging = true;
        log("Started dragging");
    }
}

function handleInteraction(e) {
    if (!restrictedArea) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isResizing) {
        resizeRestrictedArea(mouseX, mouseY);
    } else if (isDragging) {
        dragRestrictedArea(mouseX, mouseY);
    } else {
        updateCursor(mouseX, mouseY);
    }
}

function stopInteraction() {
    if (isDragging || isResizing) {
        log(isDragging ? "Stopped dragging" : "Stopped resizing");
        setRestrictedArea();
    }
    isDragging = false;
    isResizing = false;
    resizeHandle = '';
    canvas.style.cursor = 'default';
}

function resizeRestrictedArea(mouseX, mouseY) {
    const dx = mouseX - startX;
    const dy = mouseY - startY;

    if (resizeHandle.includes('w')) {
        restrictedArea.x += dx;
        restrictedArea.width -= dx;
    }
    if (resizeHandle.includes('n')) {
        restrictedArea.y += dy;
        restrictedArea.height -= dy;
    }
    if (resizeHandle.includes('e')) {
        restrictedArea.width += dx;
    }
    if (resizeHandle.includes('s')) {
        restrictedArea.height += dy;
    }

    startX = mouseX;
    startY = mouseY;
    drawRestrictedArea();
}

function dragRestrictedArea(mouseX, mouseY) {
    const dx = mouseX - startX;
    const dy = mouseY - startY;

    restrictedArea.x += dx;
    restrictedArea.y += dy;

    startX = mouseX;
    startY = mouseY;
    drawRestrictedArea();
}

function getResizeHandle(x, y) {
    const handleSize = 10;
    let handle = '';

    if (Math.abs(x - restrictedArea.x) < handleSize) handle += 'w';
    if (Math.abs(y - restrictedArea.y) < handleSize) handle += 'n';
    if (Math.abs(x - (restrictedArea.x + restrictedArea.width)) < handleSize) handle += 'e';
    if (Math.abs(y - (restrictedArea.y + restrictedArea.height)) < handleSize) handle += 's';

    return handle;
}

function updateCursor(x, y) {
    const handle = getResizeHandle(x, y);
    if (handle) {
        canvas.style.cursor = handle + '-resize';
    } else if (isInsideRectangle(x, y)) {
        canvas.style.cursor = 'move';
    } else {
        canvas.style.cursor = 'default';
    }
}

function isInsideRectangle(x, y) {
    return x > restrictedArea.x && x < restrictedArea.x + restrictedArea.width &&
           y > restrictedArea.y && y < restrictedArea.y + restrictedArea.height;
}

function clearCanvas() {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function setRestrictedArea() {
    log("Setting restricted area");
    if (restrictedArea) {
        fetch('/set_restricted_area', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ area: [
                {x: restrictedArea.x / canvas.width, y: restrictedArea.y / canvas.height},
                {x: (restrictedArea.x + restrictedArea.width) / canvas.width, y: restrictedArea.y / canvas.height},
                {x: (restrictedArea.x + restrictedArea.width) / canvas.width, y: (restrictedArea.y + restrictedArea.height) / canvas.height},
                {x: restrictedArea.x / canvas.width, y: (restrictedArea.y + restrictedArea.height) / canvas.height}
            ]}),
        })
        .then(response => response.json())
        .then(data => {
            log('Restricted area set successfully');
        })
        .catch((error) => {
            log('Error setting restricted area: ' + error);
        });
    }
}

function drawRestrictedArea() {
    if (ctx && restrictedArea) {
        clearCanvas();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(restrictedArea.x, restrictedArea.y, restrictedArea.width, restrictedArea.height);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(restrictedArea.x, restrictedArea.y, restrictedArea.width, restrictedArea.height);
    }
}

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
        updateVideoFeed(url);
    })
    .catch((error) => {
        log('Error setting RTSP URL: ' + error);
    });
}

function updateVideoFeed(url) {
    log("Updating video feed");
    videoFeed.src = `/video_feed?t=${new Date().getTime()}`;
}

function fetchDetectionData() {
    fetch('/get_detection_data')
    .then(response => response.json())
    .then(data => {
        updateDetectionDisplay(data);
    })
    .catch((error) => {
        log('Error fetching detection data: ' + error);
    });
}

function updateDetectionDisplay(data) {
    const detectionInfo = document.getElementById('detection-info');
    detectionInfo.innerHTML = `
        <p><strong>Detected Persons:</strong> ${data.detected_persons}</p>
        <p><strong>Total Intruders:</strong> ${data.total_intruders}</p>
        <p><strong>Current Intruders:</strong> ${data.current_intruders}</p>
        <p><strong>Last Intruder Hash:</strong> ${data.last_intruder_hash || 'None'}</p>
    `;
    log(`Updated detection data: ${data.detected_persons} persons, ${data.current_intruders} current intruders, ${data.total_intruders} total intruders`);
}