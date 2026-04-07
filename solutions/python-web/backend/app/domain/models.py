from typing import Dict, List, Optional

from pydantic import BaseModel


class Vec3(BaseModel):
    x: float
    y: float
    z: float


class Rotation(BaseModel):
    x: float
    y: float
    z: float


class FieldCorner(Vec3):
    id: str


class FieldAxes(BaseModel):
    right: Vec3
    up: Vec3
    forward: Vec3


class FieldValidation(BaseModel):
    rectangularityError: float
    fourthCornerError: float


class FieldPose(BaseModel):
    origin: Vec3
    corners: List[FieldCorner]
    axes: FieldAxes
    normal: Vec3
    width: float
    depth: float
    isValid: bool
    confidence: float
    validation: FieldValidation


class LightPose(BaseModel):
    position: Vec3
    direction: Optional[Vec3] = None
    lightType: str
    markerId: Optional[str] = None
    confidence: float


class ObjectSize(BaseModel):
    x: float
    y: float
    z: float


class ObjectPose(BaseModel):
    className: str
    position: Vec3
    rotation: Rotation
    size: ObjectSize
    contour: Optional[list] = None
    mask: Optional[dict] = None
    confidence: float


class ShadowProjection(BaseModel):
    position: Vec3
    rotation: Rotation
    scale: Vec3
    contour: list
    opacity: float
    blur: float = 0.0
    penumbraScale: float = 1.0
    reflectionOpacity: float = 0.0
    occlusionOpacity: float = 0.0
    status: str
    confidence: float


class DetectionRequest(BaseModel):
    frameId: str = "debug-frame"
    fieldPose: FieldPose
    debug: bool = True
    detectorMode: str = "mock"
    imageBase64: Optional[str] = None
    fieldImageCorners: Optional[List[Vec3]] = None


class DetectionResponse(BaseModel):
    objectPose: ObjectPose


class ShadowRequest(BaseModel):
    fieldPose: FieldPose
    lightPose: LightPose
    objectPose: ObjectPose


class ShadowResponse(BaseModel):
    shadowProjection: ShadowProjection


class DebugState(BaseModel):
    mode: str
    markerVisibility: Dict[str, bool]
    fieldValid: bool
    projectionStatus: str
    errors: List[str]
    selectedEntity: str
    toggles: Dict[str, bool]
