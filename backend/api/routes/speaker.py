from fastapi import APIRouter
from backend.api.schemas.contracts import APIResponse, SpeakerVerifyRequest
from modules.speaker_analysis.adapter import SpeakerAnalysisAdapter
from backend.config import settings

router = APIRouter()

@router.post("/speaker/verify", response_model=APIResponse)
def verify_speaker(payload: SpeakerVerifyRequest):
    adapter = SpeakerAnalysisAdapter(mode=settings.MODEL_MODE)
    res = adapter.verify_speaker(
        audio_data=payload.audio_b64,
        claimed_speaker=payload.claimed_speaker_id,
        metadata=payload.metadata
    )
    return APIResponse(success=True, data=res, error=None)
