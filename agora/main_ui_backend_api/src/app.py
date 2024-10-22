from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cameras, zones, regions, hvacs

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(cameras.router)
app.include_router(zones.router)
app.include_router(regions.router)
app.include_router(hvacs.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)