let videoFeed;
let detectionAreas = [];
let nextAreaId = 0;
let cameraInitialized = false;

const colors = [
    'rgba(255, 0, 0, 0.3)',   // Red
    'rgba(0, 255, 0, 0.3)',   // Green
    'rgba(0, 0, 255, 0.3)',   // Blue
    'rgba(255, 255, 0, 0.3)', // Yellow
    'rgba(255, 0, 255, 0.3)', // Magenta
    'rgba(0, 255, 255, 0.3)'  // Cyan
];

function log(message) {
    const consoleWindow = document.getElementById('console-window');
    consoleWindow.innerHTML += `${new Date().toLocaleTimeString()} - ${message}<br>`;
    consoleWindow.scrollTop = consoleWindow.scrollHeight;
}

document.addEventListener('DOMContentLoaded', (event) => {
    log("Application initialized");
    videoFeed = document.getElementById('video-feed');
    setInterval(fetchDetectionData, 1000);
});

function addDetectionArea() {
    const areaId = nextAreaId++;
    const canvas = document.createElement('canvas');
    canvas.id = `overlay-canvas-${areaId}`;
    canvas.className = 'overlay-canvas';
    document.getElementById('video-container').appendChild(canvas);

    const colorIndex = areaId % colors.length;
    const color = colors[colorIndex];

    const area = {
        id: areaId,
        canvas: canvas,
        ctx: null,
        restrictedArea: null,
        color: color,
        isDragging: false,
        isResizing: false,
        startX: 0,
        startY: 0,
        resizeHandle: ''
    };

    detectionAreas.push(area);

    const areaElement = document.createElement('div');
    areaElement.className = 'detection-area';
    areaElement.innerHTML = `
        <span>Detection Area ${areaId}</span>
        <button onclick="removeDetectionArea(${areaId})">Remove</button>
        <button onclick="changeColor(${areaId})">Change Color</button>
    `;
    document.getElementById('detection-areas').appendChild(areaElement);

    initializeCanvas(area);
    log(`Added detection area ${areaId}`);
}

function removeDetectionArea(areaId) {
    const index = detectionAreas.findIndex(area => area.id === areaId);
    if (index !== -1) {
        const area = detectionAreas[index];
        area.canvas.remove();
        detectionAreas.splice(index, 1);
        document.querySelector(`.detection-area:nth-child(${index + 1})`).remove();
        log(`Removed detection area ${areaId}`);
        sendRestrictedAreas();
    }
}

function changeColor(areaId) {
    const area = detectionAreas.find(a => a.id === areaId);
    if (area) {
        const currentIndex = colors.indexOf(area.color);
        const newIndex = (currentIndex + 1) % colors.length;
        area.color = colors[newIndex];
        drawRestrictedArea(area);
        log(`Changed color of detection area ${areaId}`);
    }
}

function initializeCanvas(area) {
    function resizeCanvas() {
        const rect = videoFeed.getBoundingClientRect();
        area.canvas.width = rect.width;
        area.canvas.height = rect.height;
        area.ctx = area.canvas.getContext('2d');
        
        if (!area.restrictedArea) {
            area.restrictedArea = {
                x: area.canvas.width * 0.25,
                y: area.canvas.height * 0.25,
                width: area.canvas.width * 0.5,
                height: area.canvas.height * 0.5
            };
            requestAnimationFrame(() => drawRestrictedArea(area));
        }
        
        log(`Canvas ${area.id} resized to: ${area.canvas.width}x${area.canvas.height}`);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    area.canvas.addEventListener('mousedown', (e) => startInteraction(e, area));
    area.canvas.addEventListener('mousemove', (e) => handleInteraction(e, area));
    area.canvas.addEventListener('mouseup', () => stopInteraction(area));

    videoFeed.addEventListener('load', resizeCanvas);
}

function startInteraction(e, area) {
    if (!area.restrictedArea) return;

    const rect = area.canvas.getBoundingClientRect();
    area.startX = e.clientX - rect.left;
    area.startY = e.clientY - rect.top;

    const handle = getResizeHandle(area.startX, area.startY, area);
    if (handle) {
        area.isResizing = true;
        area.resizeHandle = handle;
        log(`Started resizing area ${area.id} from ${handle}`);
    } else if (isInsideRectangle(area.startX, area.startY, area)) {
        area.isDragging = true;
        log(`Started dragging area ${area.id}`);
    }
}

function handleInteraction(e, area) {
    if (!area.restrictedArea) return;

    const rect = area.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (area.isResizing) {
        resizeRestrictedArea(mouseX, mouseY, area);
    } else if (area.isDragging) {
        dragRestrictedArea(mouseX, mouseY, area);
    } else {
        updateCursor(mouseX, mouseY, area);
    }
}

function stopInteraction(area) {
    if (area.isDragging || area.isResizing) {
        log(area.isDragging ? `Stopped dragging area ${area.id}` : `Stopped resizing area ${area.id}`);
        sendRestrictedAreas();
    }
    area.isDragging = false;
    area.isResizing = false;
    area.resizeHandle = '';
    area.canvas.style.cursor = 'default';
}

function resizeRestrictedArea(mouseX, mouseY, area) {
    const dx = mouseX - area.startX;
    const dy = mouseY - area.startY;

    if (area.resizeHandle.includes('w')) {
        area.restrictedArea.x += dx;
        area.restrictedArea.width -= dx;
    }
    if (area.resizeHandle.includes('n')) {
        area.restrictedArea.y += dy;
        area.restrictedArea.height -= dy;
    }
    if (area.resizeHandle.includes('e')) {
        area.restrictedArea.width += dx;
    }
    if (area.resizeHandle.includes('s')) {
        area.restrictedArea.height += dy;
    }

    area.startX = mouseX;
    area.startY = mouseY;
    
    requestAnimationFrame(() => drawRestrictedArea(area));
}

function dragRestrictedArea(mouseX, mouseY, area) {
    const dx = mouseX - area.startX;
    const dy = mouseY - area.startY;

    area.restrictedArea.x += dx;
    area.restrictedArea.y += dy;

    area.startX = mouseX;
    area.startY = mouseY;
    
    requestAnimationFrame(() => drawRestrictedArea(area));
}

function getResizeHandle(x, y, area) {
    const handleSize = 10;
    let handle = '';

    if (Math.abs(x - area.restrictedArea.x) < handleSize) handle += 'w';
    if (Math.abs(y - area.restrictedArea.y) < handleSize) handle += 'n';
    if (Math.abs(x - (area.restrictedArea.x + area.restrictedArea.width)) < handleSize) handle += 'e';
    if (Math.abs(y - (area.restrictedArea.y + area.restrictedArea.height)) < handleSize) handle += 's';

    return handle;
}

function updateCursor(x, y, area) {
    const handle = getResizeHandle(x, y, area);
    if (handle) {
        area.canvas.style.cursor = handle + '-resize';
    } else if (isInsideRectangle(x, y, area)) {
        area.canvas.style.cursor = 'move';
    } else {
        area.canvas.style.cursor = 'default';
    }
}

function isInsideRectangle(x, y, area) {
    return x > area.restrictedArea.x && x < area.restrictedArea.x + area.restrictedArea.width &&
           y > area.restrictedArea.y && y < area.restrictedArea.y + area.restrictedArea.height;
}

function clearCanvas(area) {
    if (area.ctx) {
        area.ctx.clearRect(0, 0, area.canvas.width, area.canvas.height);
    }
}

function drawRestrictedArea(area) {
    if (!area.ctx || !area.restrictedArea) return;
    
    clearCanvas(area);
    
    area.ctx.fillStyle = area.color;
    area.ctx.fillRect(area.restrictedArea.x, area.restrictedArea.y, area.restrictedArea.width, area.restrictedArea.height);
    area.ctx.strokeStyle = area.color.replace('0.3', '1');
    area.ctx.lineWidth = 2;
    area.ctx.strokeRect(area.restrictedArea.x, area.restrictedArea.y, area.restrictedArea.width, area.restrictedArea.height);
}

function sendRestrictedAreas() {
    const videoUrl = document.getElementById('video-url').value;
    const areas = detectionAreas.map(area => {
        if (area.restrictedArea) {
            return {
                id: area.id,
                area: [
                    {x: area.restrictedArea.x / area.canvas.width, y: area.restrictedArea.y / area.canvas.height},
                    {x: (area.restrictedArea.x + area.restrictedArea.width) / area.canvas.width, y: area.restrictedArea.y / area.canvas.height},
                    {x: (area.restrictedArea.x + area.restrictedArea.width) / area.canvas.width, y: (area.restrictedArea.y + area.restrictedArea.height) / area.canvas.height},
                    {x: area.restrictedArea.x / area.canvas.width, y: (area.restrictedArea.y + area.restrictedArea.height) / area.canvas.height}
                ],
                color: area.color
            };
        }
        return null;
    }).filter(area => area !== null);

    fetch('/set_restricted_areas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areas: areas, video_url: !cameraInitialized || videoUrl == ""  ? "" : videoUrl}),
    })
    .then(response => response.json())
    .then(data => {
        log('Restricted areas set successfully');
    })
    .catch((error) => {
        log('Error setting restricted areas: ' + error);
    });
}

function setVideoSource() {
    log("Setting video source");
    const url = document.getElementById('video-url').value;
    const cameraName = `camera_${Math.floor(Math.random() * 1000)}`;
    fetch('/set_video_source', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url, x: 0, y: 0, w: 0, h: 1, debug: false, cameraName }),
    })
    .then(response => response.json())
    .then(data => {
        log('Video source set successfully');
        updateVideoFeed(url);
    })
    .catch((error) => {
        log('Error setting video source: ' + error);
    });
}

function updateVideoFeed(url) {
    log("Updating video feed");
    const data = {
    };
    const jsonData = encodeURIComponent(JSON.stringify(data));
    videoFeed.src = `/video_feed/${encodeURIComponent(url)}?data=${jsonData}`;
    cameraInitialized = true;
}

function fetchDetectionData() {
    const videoUrl = document.getElementById('video-url').value;
    const url = !cameraInitialized || videoUrl == ""  ? "/status" : `/status?video_url=${encodeURIComponent(videoUrl)}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if(data.message && data.message.includes('not')){
            log(data.message)
        }
        else{
            updateDetectionDisplay(data);
        }
    })
    .catch((error) => {
        log('Error fetching detection data: ' + error);
    });
}

function updateDetectionDisplay(data) {
    const detectionInfo = document.getElementById('detection-info');
    let html = `
        <p><strong>Detected Persons:</strong> ${data.detected_persons}</p>
        <p><strong>Total Intruders:</strong> ${data.total_intruders}</p>
        <p><strong>Current Intruders:</strong> ${data.current_intruders}</p>
        <p><strong>Last Intruder Hash:</strong> ${data.last_intruder_hash || 'None'}</p>
        <h4>Area Statistics:</h4>
    `;

    for (const [areaId, stats] of Object.entries(data.area_stats)) {
        html += `
            <p><strong>Area ${areaId}:</strong> Current: ${stats.current_count}, Total: ${stats.total_count}</p>
        `;
    }

    html += `<h4>People Near Areas:</h4>`;
    for (const [personHash, areas] of Object.entries(data.people_near_areas)) {
        html += `<p><strong>Person ${personHash}:</strong></p>`;
        for (const [areaId, times] of Object.entries(areas)) {
            const duration = ((times.end_time - times.start_time) / 60).toFixed(2);
            html += `
                <p>Area ${areaId}: Start: ${new Date(times.start_time * 1000).toLocaleTimeString()}, 
                               End: ${new Date(times.end_time * 1000).toLocaleTimeString()},
                               Duration: ${duration} minutes</p>
            `;
        }
    }

    detectionInfo.innerHTML = html;
    log(`Updated detection data: ${data.detected_persons} persons, ${data.current_intruders} current intruders, ${data.total_intruders} total intruders`);
}