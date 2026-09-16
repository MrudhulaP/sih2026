"""
Segmentation stage: "Segmentation -> Pixel-level object masks"
For each YOLO bounding box, crop the region, run it through the U-Net,
and place the resulting mask back into full-image coordinates.
"""

from typing import Dict, Any, Tuple
import numpy as np
import cv2
import torch

from app.config import UNET_INPUT_SIZE, MASK_BINARIZE_THRESHOLD, DEVICE
from app.models.unet_model import load_unet_model


def _crop_with_padding(image: np.ndarray, x1: int, y1: int, x2: int, y2: int, pad: int = 10):
    h, w = image.shape[:2]
    x1p = max(0, x1 - pad)
    y1p = max(0, y1 - pad)
    x2p = min(w, x2 + pad)
    y2p = min(h, y2 + pad)
    return image[y1p:y2p, x1p:x2p], (x1p, y1p, x2p, y2p)


def segment_object(preprocessed_image: np.ndarray, bbox: Dict[str, Any]) -> Tuple[np.ndarray, int]:
    """
    Run U-Net segmentation on the crop defined by `bbox`.

    Args:
        preprocessed_image: full grayscale uint8 image
        bbox: dict with x1, y1, x2, y2 (bounding box from detection stage)

    Returns:
        (full_size_mask, mask_area_px) where full_size_mask is a binary
        (0/1) uint8 mask the same size as the input image.
    """
    model = load_unet_model()

    x1, y1, x2, y2 = int(bbox["x1"]), int(bbox["y1"]), int(bbox["x2"]), int(bbox["y2"])
    crop, (px1, py1, px2, py2) = _crop_with_padding(preprocessed_image, x1, y1, x2, y2)

    if crop.size == 0:
        full_mask = np.zeros(preprocessed_image.shape[:2], dtype=np.uint8)
        return full_mask, 0

    resized = cv2.resize(crop, UNET_INPUT_SIZE[::-1])  # cv2 wants (W, H)
    tensor = torch.from_numpy(resized).float().unsqueeze(0).unsqueeze(0) / 255.0
    tensor = tensor.to(DEVICE)

    with torch.no_grad():
        pred = model(tensor)  # shape (1, 1, H, W), values 0-1

    pred_mask = pred.squeeze().cpu().numpy()
    binary_mask = (pred_mask > MASK_BINARIZE_THRESHOLD).astype(np.uint8)

    # resize mask back to the crop's original size, then paste into full image
    crop_h, crop_w = crop.shape[:2]
    mask_at_crop_size = cv2.resize(binary_mask, (crop_w, crop_h), interpolation=cv2.INTER_NEAREST)

    full_mask = np.zeros(preprocessed_image.shape[:2], dtype=np.uint8)
    full_mask[py1:py2, px1:px2] = mask_at_crop_size

    mask_area_px = int(full_mask.sum())
    return full_mask, mask_area_px