"""
Ties denoise.py + normalize.py into a single preprocessing step used by
the API route. This is the "Preprocessing: Enhance & Normalize" stage
from the pipeline diagram.
"""

import cv2
import numpy as np

from app.preprocessing.denoise import denoise_sonar_image
from app.preprocessing.normalize import to_grayscale, apply_clahe, normalize_pixel_range


def preprocess_image(image: np.ndarray) -> np.ndarray:
    """
    Full preprocessing chain:
      1. Convert to grayscale (sonar images are effectively single-channel)
      2. Denoise (median + non-local means)
      3. CLAHE contrast enhancement
      4. Normalize pixel range to 0-255

    Returns a single-channel (grayscale) uint8 image ready for detection.
    """
    gray = to_grayscale(image)
    denoised = denoise_sonar_image(gray)
    enhanced = apply_clahe(denoised)
    normalized = normalize_pixel_range(enhanced)
    return normalized