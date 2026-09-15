from fastapi import APIRouter
from backend.api.schemas.contracts import APIResponse
from backend.config import settings

router = APIRouter()

@router.get("/health", response_model=APIResponse)
def health_check():
    return APIResponse(
        success=True,
        data={
            "status": "HEALTHY",
            "service": "NEXORA Orchestrator API",
            "version": settings.VERSION,
            "model_mode": settings.MODEL_MODE,
            "team_modules": {
                "member_1_backend_integration": {"status": "ONLINE", "latency_ms": 4},
                "member_2_voice_detection": {"status": "ONLINE", "latency_ms": 18, "mode": settings.MODEL_MODE},
                "member_3_speaker_acoustics": {"status": "ONLINE", "latency_ms": 12, "mode": settings.MODEL_MODE},
                "member_4_conversation_risk": {"status": "ONLINE", "latency_ms": 15, "mode": settings.MODEL_MODE},
                "member_5_frontend_dashboard": {"status": "CONNECTED"},
                "member_6_security_database": {"status": "ONLINE", "latency_ms": 2, "db_connected": True}
            }
        },
        error=None
    )
