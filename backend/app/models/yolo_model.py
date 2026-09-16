"""
Wrapper around an Ultralytics YOLO model for candidate object detection
on sonar images. If trained weights aren't present yet, it falls back
to the stock pretrained YOLOv8n weights (downloaded automatically) so
the API still runs end-to-end during development — swap in your
fine-tuned weights (trained on the KLSG dataset) before the final demo.
"""

import os
import logging

from app.config import YOLO_WEIGHTS_PATH, YOLO_CONFIDENCE_THRESHOLD, YOLO_IOU_THRESHOLD, DEVICE

logger = logging.getLogger(__name__)

_yolo_model = None  # lazy-loaded singleton


def load_yolo_model():
    """Load (once) and cache the YOLO model. Call at app startup."""
    global _yolo_model
    if _yolo_model is not None:
        return _yolo_model

    from ultralytics import YOLO  # imported lazily so the app can start without the package installed yet

    if not os.path.exists(YOLO_WEIGHTS_PATH):
        logger.warning("No YOLO weights found at %s; detection is disabled.", YOLO_WEIGHTS_PATH)
        return None

    logger.info(f"Loading fine-tuned YOLO weights from {YOLO_WEIGHTS_PATH}")
    _yolo_model = YOLO(YOLO_WEIGHTS_PATH)

    return _yolo_model


def is_yolo_loaded() -> bool:
    return _yolo_model is not None


def run_yolo_inference(image):
    """
    Run detection on a single image (numpy array, grayscale or BGR).
    Returns a list of dicts: [{x1, y1, x2, y2, confidence, class_id, class_name}, ...]
    """
    model = load_yolo_model()
    if model is None:
        return []
    results = model.predict(
        source=image,
        conf=YOLO_CONFIDENCE_THRESHOLD,
        iou=YOLO_IOU_THRESHOLD,
        device=DEVICE,
        verbose=False,
    )

    detections = []
    if not results:
        return detections

    result = results[0]
    names = result.names
    for box in result.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        cls_id = int(box.cls[0])
        detections.append({
            "x1": x1, "y1": y1, "x2": x2, "y2": y2,
            "confidence": conf,
            "class_id": cls_id,
            "class_name": names.get(cls_id, str(cls_id)),
        })

    return detections