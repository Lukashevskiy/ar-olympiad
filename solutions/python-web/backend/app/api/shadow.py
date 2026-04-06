from fastapi import APIRouter

from app.domain.models import ShadowRequest, ShadowResponse
from app.services.shadow_math import project_shadow

router = APIRouter(prefix="/api/project", tags=["shadow"])


@router.post("/shadow", response_model=ShadowResponse)
def project_shadow_api(request: ShadowRequest):
    return {
        "shadowProjection": project_shadow(
            request.fieldPose.model_dump(),
            request.lightPose.model_dump(),
            request.objectPose.model_dump(),
        )
    }
