from fastapi import APIRouter

from app.domain.models import DetectionRequest, DetectionResponse
from app.services.detection_service import mock_detect_object

router = APIRouter(prefix="/api/detect", tags=["detection"])


@router.post("/object", response_model=DetectionResponse)
def detect_object(request: DetectionRequest):
    return {"objectPose": mock_detect_object(request.fieldPose.model_dump())}
