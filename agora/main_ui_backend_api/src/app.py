from fastapi import FastAPI
from routers import cameras, zones, regions, ovens, fridges

app = FastAPI()

app.include_router(cameras.router)
app.include_router(zones.router)
app.include_router(regions.router)
app.include_router(ovens.router)
app.include_router(fridges.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)