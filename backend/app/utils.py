"""
Helper functions shared across the app: image IO, id generation,
saving results to JSON/CSV, and mask run-length encoding.
"""

import csv
import json
import os
import uuid
from typing import List, Dict, Any

import cv2
import numpy as np

from app.config import RESULTS_DIR


def new_image_id() -> str:
    """Generate a short unique id for each processed image/request."""
    return uuid.uuid4().hex[:12]


def read_image(file_bytes: bytes) -> np.ndarray:
    """Decode raw bytes (from an uploaded file) into an OpenCV BGR image."""
    np_arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image. Is it a valid image file?")
    return image


def rle_encode(mask: np.ndarray) -> str:
    """
    Simple run-length encoding for a binary mask (0/1), so we don't
    dump a full pixel array into the JSON response.
    Format: "start1,len1,start2,len2,..." over the flattened mask.
    """
    flat = mask.flatten()
    diffs = np.diff(flat)
    change_indices = np.where(diffs != 0)[0] + 1
    runs = []
    start = 0
    for idx in change_indices:
        runs.append((start, idx - start, flat[start]))
        start = idx
    runs.append((start, len(flat) - start, flat[start]))

    # keep only runs of foreground (value == 1)
    fg_runs = [(s, l) for s, l, v in runs if v == 1]
    return ";".join(f"{s},{l}" for s, l in fg_runs)


def save_results(image_id: str, filename: str, result_dict: Dict[str, Any]) -> Dict[str, str]:
    """Persist the pipeline result as both JSON and CSV under results/."""
    json_path = os.path.join(RESULTS_DIR, f"{image_id}.json")
    csv_path = os.path.join(RESULTS_DIR, f"{image_id}.csv")

    with open(json_path, "w") as f:
        json.dump(result_dict, f, indent=2)

    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "object_id", "class_name", "confidence", "x1", "y1", "x2", "y2",
            "is_valid", "validation_reason", "mask_area_px",
        ])
        for obj in result_dict.get("objects", []):
            bbox = obj["bbox"]
            seg = obj.get("segmentation") or {}
            writer.writerow([
                obj["object_id"], bbox["class_name"], bbox["confidence"],
                bbox["x1"], bbox["y1"], bbox["x2"], bbox["y2"],
                obj["is_valid"], obj["validation_reason"],
                seg.get("mask_area_px", ""),
            ])

    return {"json_path": json_path, "csv_path": csv_path}