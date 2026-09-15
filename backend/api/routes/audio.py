from fastapi import APIRouter
from backend.api.schemas.contracts import APIResponse, AudioAnalyzeRequest
from modules.speaker_analysis.adapter import SpeakerAnalysisAdapter
from backend.config import settings

router = APIRouter()

@router.post("/audio/analyze", response_model=APIResponse)
def analyze_audio(payload: AudioAnalyzeRequest):
    adapter = SpeakerAnalysisAdapter(mode=settings.MODEL_MODE)
    res = adapter.verify_speaker(audio_data=payload.audio_b64)
    audio_features = {
        "audio_anomaly_score": res["audio_anomaly_score"],
        "acoustic_pitch_std": res["acoustic_pitch_std"],
        "background_noise_snr": res["background_noise_snr"],
        "spectral_flatness": 0.042,
        "sample_rate_hz": 16000
    }
    return APIResponse(success=True, data=audio_features, error=None)
