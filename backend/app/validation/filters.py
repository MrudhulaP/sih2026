"""
Validation stage: "Filter natural terrain, reduce false positives,
use sonar context" — this is the rule-based sanity-check layer that
sits after detection + segmentation and before results are reported.

Each check is intentionally simple and explainable (judges/reviewers
can see exactly why something was flagged), and easy to extend with
more sonar-specific heuristics as you get real data.
"""

from typing import Dict, Any, Tuple

from app.config import (
    MIN_OBJECT_AREA_PX,
    MAX_OBJECT_AREA_RATIO,
    MIN_ASPECT_RATIO,
    VALIDATION_CONFIDENCE_FLOOR,
)


def _bbox_aspect_ratio(bbox: Dict[str, Any]) -> float:
    w = max(bbox["x2"] - bbox["x1"], 1e-6)
    h = max(bbox["y2"] - bbox["y1"], 1e-6)
    return min(w, h) / max(w, h)


def validate_object(
    bbox: Dict[str, Any],
    mask_area_px: int,
    image_shape: Tuple[int, int],
) -> Tuple[bool, str]:
    """
    Run heuristic false-positive filtering on one detected+segmented object.

    Returns:
        (is_valid, reason) — reason explains the decision either way,
        useful for debugging and for showing "why" in the demo UI.
    """
    image_h, image_w = image_shape
    image_area = image_h * image_w

    # 1. Confidence floor
    if bbox["confidence"] < VALIDATION_CONFIDENCE_FLOOR:
        return False, f"confidence {bbox['confidence']:.2f} below floor {VALIDATION_CONFIDENCE_FLOOR}"

    # 2. Segmented area too small -> likely noise speckle, not a real object
    if mask_area_px < MIN_OBJECT_AREA_PX:
        return False, f"segmented area {mask_area_px}px smaller than minimum {MIN_OBJECT_AREA_PX}px"

    # 3. Segmented area too large relative to the image -> likely a misread
    #    patch of seabed/terrain rather than a discrete object
    if mask_area_px > MAX_OBJECT_AREA_RATIO * image_area:
        return False, "segmented area implausibly large relative to image (likely seabed terrain)"

    # 4. Extremely thin/elongated boxes are often scan-line artifacts
    if _bbox_aspect_ratio(bbox) < MIN_ASPECT_RATIO:
        return False, "bounding box aspect ratio too extreme (likely scan-line artifact)"

    return True, "passed all validation checks"