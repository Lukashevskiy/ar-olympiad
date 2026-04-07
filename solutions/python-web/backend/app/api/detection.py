from fastapi import APIRouter

from app.domain.models import DetectionRequest, DetectionResponse
from app.services.detection_service import detect_object as run_detection

router = APIRouter(prefix="/api/detect", tags=["detection"])


@router.post("/object", response_model=DetectionResponse)
def detect_object(request: DetectionRequest):
    return {"objectPose": run_detection(request.model_dump())}
