from fastapi import APIRouter
from backend.api.schemas.contracts import APIResponse, VoiceDetectRequest
from modules.voice_detection.adapter import VoiceDetectionAdapter
from backend.config import settings

router = APIRouter()

@router.post("/voice/detect", response_model=APIResponse)
def detect_voice(payload: VoiceDetectRequest):
    adapter = VoiceDetectionAdapter(mode=settings.MODEL_MODE)
    res = adapter.detect_authenticity(
        audio_data=payload.audio_b64,
        metadata=payload.metadata
    )
    return APIResponse(success=True, data=res, error=None)
