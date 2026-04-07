from app.cv.ball_detector import detect_ball_object_pose


def mock_detect_object(field_pose: dict) -> dict:
    return {
        "className": "mock-cylinder",
        "position": {
            "x": field_pose["origin"]["x"] + 0.1,
            "y": field_pose["origin"]["y"] + 0.2,
            "z": field_pose["origin"]["z"] + 0.04,
        },
        "rotation": {"x": 0.0, "y": 15.0, "z": 0.0},
        "size": {"x": 0.16, "y": 0.4, "z": 0.16},
        "contour": [],
        "mask": None,
        "confidence": 0.82,
    }


def detect_object(request: dict) -> dict:
    detector_mode = request.get("detectorMode", "mock")
    field_pose = request["fieldPose"]

    if detector_mode == "ball-cv" and request.get("imageBase64"):
        detected = detect_ball_object_pose(
            request["imageBase64"],
            field_pose,
            request.get("fieldImageCorners"),
        )
        if detected is not None:
            return detected

    return mock_detect_object(field_pose)
