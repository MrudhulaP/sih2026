"""
Central configuration for the sonar debris-detection backend.
Keep every tunable value here so you don't hunt through files during demo prep.
"""

import os

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
WEIGHTS_DIR = os.path.join(BASE_DIR, "weights")

YOLO_WEIGHTS_PATH = os.path.join(WEIGHTS_DIR, "yolo_debris.pt")
UNET_WEIGHTS_PATH = os.path.join(WEIGHTS_DIR, "unet_debris.pt")

# --- Detection settings ---
YOLO_CONFIDENCE_THRESHOLD = 0.35
YOLO_IOU_THRESHOLD = 0.45
DEVICE = "cpu"  # change to "cuda" if a GPU is available

# --- Segmentation settings ---
UNET_INPUT_SIZE = (256, 256)  # (H, W) the U-Net expects
MASK_BINARIZE_THRESHOLD = 0.5

# --- Validation / false-positive filtering ---
MIN_OBJECT_AREA_PX = 40        # ignore blobs smaller than this (likely noise)
MAX_OBJECT_AREA_RATIO = 0.5    # ignore blobs bigger than this fraction of image (likely seabed misread)
MIN_ASPECT_RATIO = 0.15        # filters out very thin noise streaks
VALIDATION_CONFIDENCE_FLOOR = 0.4  # combined confidence needed to keep a detection

# --- Preprocessing ---
CLAHE_CLIP_LIMIT = 2.0
CLAHE_TILE_GRID_SIZE = (8, 8)
DENOISE_MEDIAN_KERNEL = 5

# Make sure required directories exist at import time
for _d in (DATA_DIR, RESULTS_DIR, WEIGHTS_DIR):
    os.makedirs(_d, exist_ok=True)