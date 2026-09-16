"""
Denoising utilities for side-scan sonar imagery.
Sonar images are typically noisy (speckle noise), so we combine a
median filter (good for salt-and-pepper/speckle noise) with a
non-local-means pass (preserves edges better than a plain Gaussian blur).
"""

import cv2
import numpy as np

from app.config import DENOISE_MEDIAN_KERNEL


def median_denoise(image: np.ndarray, kernel_size: int = DENOISE_MEDIAN_KERNEL) -> np.ndarray:
    """Remove speckle noise with a median blur. kernel_size must be odd."""
    if kernel_size % 2 == 0:
        kernel_size += 1
    return cv2.medianBlur(image, kernel_size)


def nlm_denoise(image: np.ndarray) -> np.ndarray:
    """Non-local means denoising — slower but preserves object edges well."""
    if len(image.shape) == 2:
        return cv2.fastNlMeansDenoising(image, None, h=10, templateWindowSize=7, searchWindowSize=21)
    return cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)


def denoise_sonar_image(image: np.ndarray) -> np.ndarray:
    """Full denoise chain: median filter first, then non-local means."""
    step1 = median_denoise(image)
    step2 = nlm_denoise(step1)
    return step2