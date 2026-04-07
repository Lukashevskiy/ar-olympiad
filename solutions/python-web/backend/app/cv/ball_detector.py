import base64
import math
from typing import Optional

import cv2
import numpy as np


def _decode_base64_image(image_base64: str) -> np.ndarray:
    payload = image_base64.split(",", 1)[-1]
    raw = base64.b64decode(payload)
    image = np.frombuffer(raw, dtype=np.uint8)
    decoded = cv2.imdecode(image, cv2.IMREAD_COLOR)
    if decoded is None:
        raise ValueError("Failed to decode imageBase64 payload")
    return decoded


def _bilerp_point(corners: list[dict], u: float, v: float) -> dict:
    nw, ne, se, sw = corners
    return {
        "x": (1 - u) * (1 - v) * nw["x"] + u * (1 - v) * ne["x"] + u * v * se["x"] + (1 - u) * v * sw["x"],
        "y": (1 - u) * (1 - v) * nw["y"] + u * (1 - v) * ne["y"] + u * v * se["y"] + (1 - u) * v * sw["y"],
        "z": (1 - u) * (1 - v) * nw["z"] + u * (1 - v) * ne["z"] + u * v * se["z"] + (1 - u) * v * sw["z"],
    }


def _surface_point_with_height(field_pose: dict, u: float, v: float, height: float) -> dict:
    anchor = _bilerp_point(field_pose["corners"], u, v)
    normal = field_pose["normal"]
    return {
        "x": anchor["x"] + normal["x"] * height,
        "y": anchor["y"] + normal["y"] * height,
        "z": anchor["z"] + normal["z"] * height,
    }


def _estimate_ball_size(field_pose: dict, radius_px: float, image_shape: tuple[int, int, int]) -> dict:
    image_height, image_width = image_shape[:2]
    average_pixels = max(1.0, (image_width + image_height) * 0.5)
    average_field_size = max(0.05, (field_pose["width"] + field_pose["depth"]) * 0.5)
    diameter_world = max(0.04, (radius_px * 2.0 / average_pixels) * average_field_size * 2.0)
    return {
        "x": diameter_world,
        "y": diameter_world,
        "z": diameter_world,
    }


def _default_field_polygon(image_width: int, image_height: int) -> np.ndarray:
    return np.array([
        [0, 0],
        [image_width - 1, 0],
        [image_width - 1, image_height - 1],
        [0, image_height - 1],
    ], dtype=np.int32)


def _corners_to_polygon(
    field_image_corners: Optional[list[dict]],
    image_width: int,
    image_height: int
) -> np.ndarray:
    if not field_image_corners or len(field_image_corners) != 4:
        return _default_field_polygon(image_width, image_height)

    polygon = []
    for corner in field_image_corners:
        x = corner.get("x", 0.0)
        y = corner.get("y", 0.0)

        if 0.0 <= x <= 1.0 and 0.0 <= y <= 1.0:
            px = int(round(x * (image_width - 1)))
            py = int(round(y * (image_height - 1)))
        else:
            px = int(round(x))
            py = int(round(y))

        polygon.append([
            max(0, min(image_width - 1, px)),
            max(0, min(image_height - 1, py)),
        ])

    return np.array(polygon, dtype=np.int32)


def _build_field_mask(image_width: int, image_height: int, polygon: np.ndarray) -> np.ndarray:
    field_mask = np.zeros((image_height, image_width), dtype=np.uint8)
    cv2.fillConvexPoly(field_mask, polygon, 255)
    return field_mask


def _is_circle_inside_field(
    field_mask: np.ndarray,
    center_x: float,
    center_y: float,
    radius: float
) -> bool:
    sample_points = [
        (center_x, center_y),
        (center_x - radius, center_y),
        (center_x + radius, center_y),
        (center_x, center_y - radius),
        (center_x, center_y + radius),
    ]

    height, width = field_mask.shape[:2]
    for px, py in sample_points:
        ix = int(round(px))
        iy = int(round(py))
        if ix < 0 or ix >= width or iy < 0 or iy >= height:
            return False
        if field_mask[iy, ix] == 0:
            return False
    return True


def detect_ball_object_pose(
    image_base64: str,
    field_pose: dict,
    field_image_corners: Optional[list[dict]] = None
) -> Optional[dict]:
    image = _decode_base64_image(image_base64)
    image_height, image_width = image.shape[:2]
    field_polygon = _corners_to_polygon(field_image_corners, image_width, image_height)
    field_mask = _build_field_mask(image_width, image_height, field_polygon)

    blurred = cv2.GaussianBlur(image, (9, 9), 1.5)
    hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

    lower_a = np.array([0, 110, 120], dtype=np.uint8)
    upper_a = np.array([20, 255, 255], dtype=np.uint8)
    lower_b = np.array([170, 110, 120], dtype=np.uint8)
    upper_b = np.array([179, 255, 255], dtype=np.uint8)

    mask_a = cv2.inRange(hsv, lower_a, upper_a)
    mask_b = cv2.inRange(hsv, lower_b, upper_b)
    color_mask = cv2.bitwise_or(mask_a, mask_b)
    color_mask = cv2.medianBlur(color_mask, 5)
    mask = cv2.bitwise_and(color_mask, field_mask)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    best = None

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 120:
            continue

        perimeter = cv2.arcLength(contour, True)
        if perimeter <= 1e-6:
            continue

        circularity = (4.0 * math.pi * area) / (perimeter * perimeter)
        (cx, cy), radius = cv2.minEnclosingCircle(contour)
        if radius < 8:
            continue

        if not _is_circle_inside_field(field_mask, cx, cy, radius):
            continue

        score = circularity * area
        if best is None or score > best["score"]:
            best = {
                "center_x": cx,
                "center_y": cy,
                "radius": radius,
                "area": area,
                "circularity": circularity,
                "score": score,
                "inside_field": True,
            }

    if best is None:
        return None

    u = max(0.0, min(1.0, best["center_x"] / max(1.0, image_width - 1)))
    v = max(0.0, min(1.0, best["center_y"] / max(1.0, image_height - 1)))
    size = _estimate_ball_size(field_pose, best["radius"], image.shape)
    height_above_field = size["y"] * 0.5
    position = _surface_point_with_height(field_pose, u, v, height_above_field)
    confidence = max(0.1, min(0.99, 0.45 + best["circularity"] * 0.35 + min(best["area"] / 2500.0, 0.19)))

    return {
        "className": "ball",
        "position": position,
        "rotation": {"x": 0.0, "y": 0.0, "z": 0.0},
        "size": size,
        "contour": [
            {
                "u": round(u, 4),
                "v": round(v, 4),
                "radiusPx": round(best["radius"], 2),
                "circularity": round(best["circularity"], 4),
            }
        ],
        "mask": {
            "kind": "ball-hsv-mask",
            "status": "inside-field",
            "imageSize": {"width": image_width, "height": image_height},
            "fieldPolygon": field_polygon.tolist(),
        },
        "confidence": round(confidence, 4),
    }
