"""
Pydantic models describing API request/response shapes.
Having these makes /docs (Swagger UI) self-explanatory for your demo.
"""

from typing import List, Optional
from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_id: int
    class_name: str


class SegmentedObject(BaseModel):
    mask_area_px: int
    mask_rle: str  # run-length-encoded mask string, keeps JSON small


class DetectedObject(BaseModel):
    object_id: int
    bbox: BoundingBox
    segmentation: Optional[SegmentedObject] = None
    is_valid: bool
    validation_reason: str
    estimated_width_px: Optional[float] = None
    estimated_height_px: Optional[float] = None


class PipelineResult(BaseModel):
    image_id: str
    filename: str
    image_width: int
    image_height: int
    num_detections_raw: int
    num_detections_valid: int
    objects: List[DetectedObject]
    result_json_path: str
    result_csv_path: str


class HealthResponse(BaseModel):
    status: str
    yolo_loaded: bool
    unet_loaded: bool