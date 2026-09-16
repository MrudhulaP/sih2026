import cv2
import numpy as np


def segment_object(image: np.ndarray, bbox: dict) -> tuple[np.ndarray, int]:
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    height, width = mask.shape
    x1, y1 = max(0, min(width, int(bbox["x1"]))), max(0, min(height, int(bbox["y1"])))
    x2, y2 = max(x1, min(width, int(bbox["x2"]))), max(y1, min(height, int(bbox["y2"])))
    if x2 > x1 and y2 > y1:
        roi = image[y1:y2, x1:x2]
        local_mask = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        if not np.any(local_mask):
            local_mask.fill(255)
        mask[y1:y2, x1:x2] = local_mask
    return mask, int(np.count_nonzero(mask))