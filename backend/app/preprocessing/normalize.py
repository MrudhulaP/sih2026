"""
Normalization utilities: contrast enhancement (CLAHE) and pixel-value
scaling, so sonar images with varying gain/brightness are consistent
before being fed to the detection/segmentation models.
"""

import cv2
import numpy as np

from app.config import CLAHE_CLIP_LIMIT, CLAHE_TILE_GRID_SIZE


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """Sonar imagery is often effectively single-channel; convert if needed."""
    if len(image.shape) == 3 and image.shape[2] == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image


def apply_clahe(gray_image: np.ndarray) -> np.ndarray:
    """
    Contrast Limited Adaptive Histogram Equalization.
    Boosts local contrast so faint objects on the seabed become visible
    without blowing out already-bright regions.
    """
    clahe = cv2.createCLAHE(clipLimit=CLAHE_CLIP_LIMIT, tileGridSize=CLAHE_TILE_GRID_SIZE)
    return clahe.apply(gray_image)


def normalize_pixel_range(image: np.ndarray) -> np.ndarray:
    """Scale pixel values to the full 0-255 range."""
    normalized = cv2.normalize(image, None, 0, 255, cv2.NORM_MINMAX)
    return normalized.astype(np.uint8)