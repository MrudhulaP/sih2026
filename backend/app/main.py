"""
FastAPI entry point.

Run locally with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Then open http://localhost:8000/docs for interactive Swagger UI.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router
from app.models.yolo_model import load_yolo_model
from app.models.unet_model import load_unet_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Underwater Marine Debris Detection API",
    description="SIH26057 — AI-powered detection & segmentation of debris in side-scan sonar imagery.",
    version="0.1.0",
)

# Allow the frontend (running on a different origin/port) to call this API.
# Tighten allow_origins to your actual frontend URL before deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def startup_event():
    """Warm up the models once at startup instead of on the first request."""
    logger.info("Loading models...")
    load_yolo_model()
    load_unet_model()
    logger.info("Models loaded. API ready.")


@app.get("/")
def root():
    return {"message": "Marine Debris Detection API is running. See /docs for API documentation."}