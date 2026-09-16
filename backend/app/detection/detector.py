"""
Object detection stage: "AI Detection -> Find candidate objects"
Thin wrapper over the YOLO model that returns detections in a
plain-dict format the rest of the pipeline (segmentation, validation)
can consume regardless of which detector backend is used underneath.
"""

from typing import List, Dict, Any
import numpy as np

from app.models.yolo_model import run_yolo_inference


def detect_objects(preprocessed_image: np.ndarray) -> List[Dict[str, Any]]:
    """
    Run candidate-object detection on a preprocessed sonar image.

    Args:
        preprocessed_image: grayscale uint8 numpy array (output of preprocessing.pipeline)

    Returns:
        List of detection dicts: {x1, y1, x2, y2, confidence, class_id, class_name}
    """
    detections = run_yolo_inference(preprocessed_image)
    return detections