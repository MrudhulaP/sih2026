"""
API routes.

Main endpoint is POST /pipeline/run — upload a sonar image, get back
detected + segmented + validated objects, matching the
Input -> Preprocessing -> AI Detection -> Segmentation -> Actionable Result
flow from the pipeline diagram.
"""

import logging

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.schemas import PipelineResult, HealthResponse, DetectedObject, BoundingBox, SegmentedObject
from app.preprocessing import preprocess_image
from app.detection import detect_objects
from app.segmentation import segment_object
from app.validation import validate_object
from app.models.yolo_model import is_yolo_loaded
from app.models.unet_model import is_unet_loaded
from app.utils import new_image_id, read_image, rle_encode, save_results

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        yolo_loaded=is_yolo_loaded(),
        unet_loaded=is_unet_loaded(),
    )


@router.post("/pipeline/run", response_model=PipelineResult)
async def run_pipeline(file: UploadFile = File(...)):
    """
    Full pipeline: preprocessing -> detection -> segmentation -> validation.
    Upload one side-scan sonar image, get structured results back.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    raw_bytes = await file.read()
    try:
        original_image = read_image(raw_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    image_id = new_image_id()
    image_h, image_w = original_image.shape[:2]

    # 1. Preprocessing
    preprocessed = preprocess_image(original_image)

    # 2. Detection
    raw_detections = detect_objects(preprocessed)

    # 3 & 4. Segmentation + Validation per detected object
    objects = []
    for i, bbox in enumerate(raw_detections):
        mask, mask_area_px = segment_object(preprocessed, bbox)
        is_valid, reason = validate_object(bbox, mask_area_px, (image_h, image_w))

        objects.append(DetectedObject(
            object_id=i,
            bbox=BoundingBox(**bbox),
            segmentation=SegmentedObject(
                mask_area_px=mask_area_px,
                mask_rle=rle_encode(mask),
            ),
            is_valid=is_valid,
            validation_reason=reason,
            estimated_width_px=bbox["x2"] - bbox["x1"],
            estimated_height_px=bbox["y2"] - bbox["y1"],
        ))

    num_valid = sum(1 for o in objects if o.is_valid)

    result_dict = {
        "image_id": image_id,
        "filename": file.filename,
        "image_width": image_w,
        "image_height": image_h,
        "num_detections_raw": len(objects),
        "num_detections_valid": num_valid,
        "objects": [o.model_dump() for o in objects],
    }

    paths = save_results(image_id, file.filename, result_dict)

    return PipelineResult(
        image_id=image_id,
        filename=file.filename,
        image_width=image_w,
        image_height=image_h,
        num_detections_raw=len(objects),
        num_detections_valid=num_valid,
        objects=objects,
        result_json_path=paths["json_path"],
        result_csv_path=paths["csv_path"],
    )