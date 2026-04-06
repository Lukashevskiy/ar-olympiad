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
