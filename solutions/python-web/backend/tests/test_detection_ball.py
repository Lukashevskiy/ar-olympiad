import base64

import cv2
import numpy as np

from app.services.detection_service import detect_object


def _make_field_pose():
    return {
        "origin": {"x": 0.0, "y": 0.0, "z": 0.0},
        "corners": [
            {"id": "field-nw", "x": -0.5, "y": 0.0, "z": -0.5},
            {"id": "field-ne", "x": 0.5, "y": 0.0, "z": -0.5},
            {"id": "field-se", "x": 0.5, "y": 0.0, "z": 0.5},
            {"id": "field-sw", "x": -0.5, "y": 0.0, "z": 0.5},
        ],
        "axes": {
            "right": {"x": 1.0, "y": 0.0, "z": 0.0},
            "up": {"x": 0.0, "y": 1.0, "z": 0.0},
            "forward": {"x": 0.0, "y": 0.0, "z": 1.0},
        },
        "normal": {"x": 0.0, "y": 1.0, "z": 0.0},
        "width": 1.0,
        "depth": 1.0,
        "isValid": True,
        "confidence": 0.98,
        "validation": {"rectangularityError": 0.01, "fourthCornerError": 0.01},
    }


def _make_ball_image_base64():
    image = np.zeros((320, 320, 3), dtype=np.uint8)
    image[:, :] = (35, 50, 70)
    cv2.circle(image, (180, 150), 34, (0, 120, 255), thickness=-1)
    ok, encoded = cv2.imencode(".png", image)
    assert ok
    return "data:image/png;base64," + base64.b64encode(encoded.tobytes()).decode("ascii")


def test_detect_ball_object_pose():
    result = detect_object({
        "detectorMode": "ball-cv",
        "fieldPose": _make_field_pose(),
        "imageBase64": _make_ball_image_base64(),
        "fieldImageCorners": [
            {"x": 0, "y": 0, "z": 0},
            {"x": 1, "y": 0, "z": 0},
            {"x": 1, "y": 1, "z": 0},
            {"x": 0, "y": 1, "z": 0},
        ],
    })

    assert result["className"] == "ball"
    assert result["mask"]["status"] == "inside-field"
    assert result["confidence"] > 0.5
    assert result["size"]["x"] > 0.04


def test_ball_outside_field_falls_back_to_mock():
    result = detect_object({
        "detectorMode": "ball-cv",
        "fieldPose": _make_field_pose(),
        "imageBase64": _make_ball_image_base64(),
        "fieldImageCorners": [
            {"x": 0.0, "y": 0.0, "z": 0},
            {"x": 0.25, "y": 0.0, "z": 0},
            {"x": 0.25, "y": 0.25, "z": 0},
            {"x": 0.0, "y": 0.25, "z": 0},
        ],
    })

    assert result["className"] == "mock-cylinder"
