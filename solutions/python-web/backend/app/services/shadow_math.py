import math
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


def _length(v):
    return sqrt(_dot(v, v))


def _clamp(value, min_value, max_value):
    return max(min_value, min(max_value, value))


def _contour_ellipse(scale_x, scale_z, segments=16):
    contour = []
    for index in range(segments):
        angle = (index / segments) * 6.283185307179586
        contour.append({
            "x": round((scale_x * 0.5) * math.cos(angle), 4),
            "z": round((scale_z * 0.5) * math.sin(angle), 4),
        })
    return contour


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
            "blur": 0.0,
            "penumbraScale": 1.0,
            "reflectionOpacity": 0.0,
            "occlusionOpacity": 0.0,
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
            "blur": 0.0,
            "penumbraScale": 1.0,
            "reflectionOpacity": 0.0,
            "occlusionOpacity": 0.0,
            "status": "behind-ray-origin",
            "confidence": 0.1,
        }

    point = _add(ray_origin, _scale(ray_direction, t))
    vertical_gap = max(0.05, object_pose["position"]["y"] - field_origin["y"])
    angle_factor = max(0.22, abs(ray_direction["y"]))
    light_distance = _length(_sub(light_pose["position"], object_point)) if light_pose["lightType"] != "directional" else 2.5
    distance_factor = _clamp(light_distance / 1.8, 0.75, 2.2)
    stretch = min(3.4, 1.0 + (vertical_gap / angle_factor) * 0.85)
    size_x = object_pose["size"]["x"] * stretch
    size_z = object_pose["size"]["z"] * (1.0 + stretch * 0.35)
    blur = _clamp(0.08 + vertical_gap * 0.22 + (distance_factor - 1.0) * 0.12, 0.06, 0.42)
    penumbra_scale = _clamp(1.08 + vertical_gap * 0.55 + (distance_factor - 1.0) * 0.18, 1.05, 1.9)
    occlusion_opacity = _clamp(0.55 + angle_factor * 0.18 - vertical_gap * 0.16, 0.32, 0.72)
    reflection_opacity = _clamp(0.05 + (1.0 - angle_factor) * 0.12 + (light_pose["lightType"] == "ambient") * 0.08, 0.04, 0.22)
    opacity = _clamp(0.78 - vertical_gap * 0.3 - (distance_factor - 1.0) * 0.1, 0.22, 0.7)

    return {
        "position": {"x": point["x"], "y": field_origin["y"] + 0.002, "z": point["z"]},
        "rotation": {"x": -90.0, "y": object_pose["rotation"]["y"], "z": 0.0},
        "scale": {
            "x": size_x,
            "y": 1.0,
            "z": size_z,
        },
        "contour": _contour_ellipse(size_x, size_z),
        "opacity": opacity,
        "blur": blur,
        "penumbraScale": penumbra_scale,
        "reflectionOpacity": reflection_opacity,
        "occlusionOpacity": occlusion_opacity,
        "status": "ok",
        "confidence": min(
            field_pose["confidence"],
            light_pose["confidence"],
            object_pose["confidence"],
        ),
    }
