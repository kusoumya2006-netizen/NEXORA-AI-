from fastapi import APIRouter
from backend.api.schemas.contracts import APIResponse, SecurityRespondRequest
from modules.security_response.adapter import SecurityResponseAdapter
from backend.config import settings

router = APIRouter()

@router.post("/security/respond", response_model=APIResponse)
def trigger_security_response(payload: SecurityRespondRequest):
    adapter = SecurityResponseAdapter(mode=settings.MODEL_MODE)
    res = adapter.execute_response(
        risk_level=payload.risk_level,
        call_id=payload.call_id,
        context=payload.context
    )
    return APIResponse(success=True, data=res, error=None)
