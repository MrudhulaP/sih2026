def validate_object(bbox: dict, mask_area_px: int, image_shape: tuple[int, int]) -> tuple[bool, str]:
    image_height, image_width = image_shape
    box_width = bbox["x2"] - bbox["x1"]
    box_height = bbox["y2"] - bbox["y1"]
    if box_width <= 0 or box_height <= 0:
        return False, "Bounding box has no area"
    if bbox["x1"] < 0 or bbox["y1"] < 0 or bbox["x2"] > image_width or bbox["y2"] > image_height:
        return False, "Bounding box is outside image bounds"
    if mask_area_px <= 0:
        return False, "Segmentation mask is empty"
    if mask_area_px > image_width * image_height * 0.5:
        return False, "Segmentation covers too much of the image"
    return True, "Object passed geometric and segmentation checks"