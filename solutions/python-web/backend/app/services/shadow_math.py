from math import sqrt


def _sub(a, b):
    return {"x": a["x"] - b["x"], "y": a["y"] - b["y"], "z": a["z"] - b["z"]}


def _add(a, b):
    return {"x": a["x"] + b["x"], "y": a["y"] + b["y"], "z": a["z"] + b["z"]}


def _scale(v, s):
    return {"x": v["x"] * s, "y": v["y"] * s, "z": v["z"] * s}


def _dot(a, b):
    return a["x"] * b["x"] + a["y"] * b["y"] + a["z"] * b["z"]


def _normalize(v):
    length = sqrt(_dot(v, v))
    if length < 1e-8:
      return {"x": 0.0, "y": -1.0, "z": 0.0}
    return _scale(v, 1.0 / length)


def project_shadow(field_pose: dict, light_pose: dict, object_pose: dict) -> dict:
    field_origin = field_pose["origin"]
    field_normal = field_pose["normal"]
    object_point = {
        "x": object_pose["position"]["x"],
        "y": object_pose["position"]["y"] - object_pose["size"]["y"] * 0.5,
        "z": object_pose["position"]["z"],
    }
    if light_pose["lightType"] == "directional" and light_pose.get("direction"):
        ray_origin = object_point
        ray_direction = _normalize(
            {
                "x": -light_pose["direction"]["x"],
                "y": -light_pose["direction"]["y"],
                "z": -light_pose["direction"]["z"],
            }
        )
    else:
        ray_origin = light_pose["position"]
        ray_direction = _normalize(_sub(object_point, light_pose["position"]))

    denom = _dot(field_normal, ray_direction)
    if abs(denom) < 1e-6:
        return {
            "position": object_point,
            "rotation": {"x": -90.0, "y": object_pose["rotation"]["y"], "z": 0.0},
            "scale": {"x": 0.0, "y": 1.0, "z": 0.0},
            "contour": [],
            "opacity": 0.1,
            "status": "parallel-ray",
            "confidence": 0.1,
        }

    t = _dot(field_normal, _sub(field_origin, ray_origin)) / denom
    if t < 0:
        return {
            "position": object_point,
            "rotation": {"x": -90.0, "y": object_pose["rotation"]["y"], "z": 0.0},
            "scale": {"x": 0.0, "y": 1.0, "z": 0.0},
            "contour": [],
            "opacity": 0.1,
            "status": "behind-ray-origin",
            "confidence": 0.1,
        }

    point = _add(ray_origin, _scale(ray_direction, t))
    vertical_gap = max(0.05, object_pose["position"]["y"] - field_origin["y"])
    angle_factor = max(0.3, abs(ray_direction["y"]))
    stretch = min(3.0, 1.0 + vertical_gap / angle_factor)

    return {
        "position": {"x": point["x"], "y": field_origin["y"] + 0.002, "z": point["z"]},
        "rotation": {"x": -90.0, "y": object_pose["rotation"]["y"], "z": 0.0},
        "scale": {
            "x": object_pose["size"]["x"] * stretch,
            "y": 1.0,
            "z": object_pose["size"]["z"] * (1.0 + stretch * 0.35),
        },
        "contour": [],
        "opacity": max(0.2, min(0.65, 0.7 - vertical_gap * 0.4)),
        "status": "ok",
        "confidence": min(
            field_pose["confidence"],
            light_pose["confidence"],
            object_pose["confidence"],
        ),
    }
