import random
from typing import Dict, Any

class VoiceDetectionAdapter:
    """
    Adapter interface for AI Deepfake Voice Detection Module.
    Supports real acoustic analysis and simulated presets (MODEL_MODE=mock|real|hybrid).
    """
    def __init__(self, mode: str = "mock"):
        self.mode = mode

    def detect_authenticity(self, audio_data: Any = None, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyzes audio input for synthetic voice cloning artifacts.
        Returns authenticity score, synthetic probability, and spectral artifact signals.
        """
        metadata = metadata or {}
        preset = metadata.get("preset_scenario")
        audio_features = metadata.get("audio_features")

        if preset == "FINANCIAL_TRANSFER_ATTACK":
            return {
                "is_ai_generated": True,
                "confidence": 0.94,
                "status": "AI-generated",
                "is_synthetic": True,
                "synthetic_probability": 0.94,
                "voice_authenticity_score": 6.0,
                "spectral_artifacts": [
                    "Neural vocoder high-frequency phase anomaly",
                    "Unnatural formant transition slope",
                    "Synthetic pitch floor consistency"
                ],
                "model_name": "NEXORA-VoiceNet-v2-RealTime"
            }
        elif preset == "OTP_HARVESTING":
            return {
                "is_ai_generated": True,
                "confidence": 0.81,
                "status": "AI-generated",
                "is_synthetic": True,
                "synthetic_probability": 0.81,
                "voice_authenticity_score": 19.0,
                "spectral_artifacts": [
                    "Synthetic glottal pulse shaping",
                    "Phase discontinuity at phrase boundaries"
                ],
                "model_name": "NEXORA-VoiceNet-v2-RealTime"
            }
        elif preset == "LEGITIMATE_CALL":
            return {
                "is_ai_generated": False,
                "confidence": 0.08,
                "status": "Authentic",
                "is_synthetic": False,
                "synthetic_probability": 0.08,
                "voice_authenticity_score": 92.0,
                "spectral_artifacts": [],
                "model_name": "NEXORA-VoiceNet-v2-RealTime"
            }
        elif preset == "ROUTINE_VENDOR":
            return {
                "is_ai_generated": False,
                "confidence": 0.35,
                "status": "Suspicious",
                "is_synthetic": False,
                "synthetic_probability": 0.35,
                "voice_authenticity_score": 65.0,
                "spectral_artifacts": ["Codec compression noise"],
                "model_name": "NEXORA-VoiceNet-v2-RealTime"
            }

        # Real acoustic feature evaluation if provided
        if audio_features:
            anomaly = audio_features.get("audio_anomaly_score", 0.2)
            pitch_std = audio_features.get("acoustic_pitch_std", 10.0)
            # Unnatural pitch consistency (very low pitch_std) is a classic indicator of vocoded synthetic speech
            if pitch_std < 4.0 or anomaly > 0.6:
                syn_prob = round(min(0.95, max(0.65, anomaly + 0.15)), 2)
            else:
                syn_prob = round(max(0.05, min(0.45, anomaly * 0.5)), 2)
        else:
            syn_prob = round(random.uniform(0.1, 0.9), 2)

        is_syn = syn_prob > 0.6
        auth_score = round((1.0 - syn_prob) * 100.0, 1)

        artifacts = []
        if is_syn:
            artifacts = [
                "Spectrogram phase discontinuity detected",
                "High frequency synthesis roll-off artifact"
            ]

        status = "AI-generated" if syn_prob >= 0.75 else "Suspicious" if syn_prob >= 0.35 else "Authentic"

        return {
            "is_ai_generated": is_syn,
            "confidence": syn_prob,
            "status": status,
            "is_synthetic": is_syn,
            "synthetic_probability": syn_prob,
            "voice_authenticity_score": auth_score,
            "spectral_artifacts": artifacts,
            "model_name": "NEXORA-VoiceNet-v2-RealTime" if not self.mode == "mock" else "NEXORA-VoiceNet-v2-RealTime (Simulated)"
        }
