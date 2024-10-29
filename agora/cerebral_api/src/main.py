from fastapi import FastAPI, Request
from prometheus_client import start_http_server, Summary, Counter, Histogram, Gauge
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import time
import logging

app = FastAPI()

# Create Prometheus metrics
REQUEST_TIME = Summary('request_processing_seconds', 'Time spent processing request')
REQUEST_COUNT = Counter('request_count', 'Total number of requests')
REQUEST_LATENCY = Histogram('request_latency_seconds', 'Request latency')
IN_PROGRESS = Gauge('in_progress_requests', 'Number of in-progress requests')
ERROR_COUNT = Counter('error_count', 'Total number of errors')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PrometheusHandler(logging.Handler):
    def emit(self, record):
        log_entry = self.format(record)
        if record.levelname == 'ERROR':
            ERROR_COUNT.inc()
        logger.info(log_entry)

prometheus_handler = PrometheusHandler()
logger.addHandler(prometheus_handler)

@app.on_event("startup")
def startup_event():
    # Start Prometheus server to expose metrics
    start_http_server(8001)

@app.middleware("http")
async def add_prometheus_metrics(request: Request, call_next):
    start_time = time.time()
    IN_PROGRESS.inc()
    response = await call_next(request)
    IN_PROGRESS.dec()
    REQUEST_COUNT.inc()
    REQUEST_LATENCY.observe(time.time() - start_time)
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/")
@REQUEST_TIME.time()
async def read_root():
    logger.info("Processing request for root endpoint")
    return {"Hello": "World"}

@app.get("/error")
async def trigger_error():
    try:
        raise ValueError("This is a test error")
    except ValueError as e:
        logger.error(f"An error occurred: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)