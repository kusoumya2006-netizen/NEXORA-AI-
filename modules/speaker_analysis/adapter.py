import random
from typing import Dict, Any, Optional

ENROLLED_PROFILES = {
    "spk_ceo_marcus": {"name": "Marcus Vance", "title": "CEO", "baseline_pitch_std": 14.2, "baseline_snr": 35.0},
    "marcus vance": {"name": "Marcus Vance", "title": "CEO", "baseline_pitch_std": 14.2, "baseline_snr": 35.0},
    "spk_vp_sarah": {"name": "Sarah Jenkins", "title": "VP Finance", "baseline_pitch_std": 16.0, "baseline_snr": 32.0},
    "sarah jenkins": {"name": "Sarah Jenkins", "title": "VP Finance", "baseline_pitch_std": 16.0, "baseline_snr": 32.0},
    "spk_user_valid": {"name": "David Miller", "title": "IT Support Lead", "baseline_pitch_std": 14.8, "baseline_snr": 31.2},
    "david miller": {"name": "David Miller", "title": "IT Support Lead", "baseline_pitch_std": 14.8, "baseline_snr": 31.2},
    "spk_vendor_acuity": {"name": "Acuity Logistics Rep", "title": "Accounts Vendor", "baseline_pitch_std": 11.5, "baseline_snr": 28.0},
    "acuity logistics rep": {"name": "Acuity Logistics Rep", "title": "Accounts Vendor", "baseline_pitch_std": 11.5, "baseline_snr": 28.0}
}

class SpeakerAnalysisAdapter:
    """
    Adapter interface for Speaker Verification & Audio Acoustic Analysis Module.
    Extracts speaker embeddings, checks similarity against registered reference profiles,
    and measures acoustic consistency.
    """
    def __init__(self, mode: str = "mock"):
        self.mode = mode

    def verify_speaker(
        self,
        audio_data: Any = None,
        claimed_speaker: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        metadata = metadata or {}
        preset = metadata.get("preset_scenario")
        audio_features = metadata.get("audio_features")

        if preset == "FINANCIAL_TRANSFER_ATTACK":
            return {
                "matched": False,
                "confidence": 0.38,
                "verification_status": "MISMATCH",
                "speaker_match_probability": 0.38,
                "claimed_speaker_id": claimed_speaker or "spk_ceo_marcus",
                "embedding_distance": 0.82,
                "speaker_consistency_score": 38.0,
                "audio_anomaly_score": 0.86,
                "acoustic_pitch_std": 2.1,
                "background_noise_snr": 42.1
            }
        elif preset == "OTP_HARVESTING":
            return {
                "matched": False,
                "confidence": 0.45,
                "verification_status": "MISMATCH",
                "speaker_match_probability": 0.45,
                "claimed_speaker_id": claimed_speaker or "spk_vp_sarah",
                "embedding_distance": 0.69,
                "speaker_consistency_score": 45.0,
                "audio_anomaly_score": 0.74,
                "acoustic_pitch_std": 4.5,
                "background_noise_snr": 38.0
            }
        elif preset == "LEGITIMATE_CALL":
            return {
                "matched": True,
                "confidence": 0.94,
                "verification_status": "VERIFIED",
                "speaker_match_probability": 0.94,
                "claimed_speaker_id": claimed_speaker or "spk_user_valid",
                "embedding_distance": 0.09,
                "speaker_consistency_score": 94.0,
                "audio_anomaly_score": 0.05,
                "acoustic_pitch_std": 14.8,
                "background_noise_snr": 31.2
            }
        elif preset == "ROUTINE_VENDOR":
            return {
                "matched": False,
                "confidence": 0.62,
                "verification_status": "BORDERLINE",
                "speaker_match_probability": 0.62,
                "claimed_speaker_id": claimed_speaker or "spk_vendor_acuity",
                "embedding_distance": 0.41,
                "speaker_consistency_score": 62.0,
                "audio_anomaly_score": 0.39,
                "acoustic_pitch_std": 9.8,
                "background_noise_snr": 22.4
            }

        # Check speaker enrollment
        speaker_key = (claimed_speaker or "").strip().lower()
        has_enrollment = speaker_key in ENROLLED_PROFILES

        if not claimed_speaker or not has_enrollment:
            # Clearly indicate speaker verification could not be performed
            anomaly_score = audio_features.get("audio_anomaly_score", 0.1) if audio_features else 0.1
            pitch_std = audio_features.get("acoustic_pitch_std", 11.0) if audio_features else 11.0
            snr = audio_features.get("background_noise_snr", 30.0) if audio_features else 30.0

            return {
                "matched": False,
                "confidence": 0.0,
                "verification_status": "NO_REFERENCE_ENROLLED",
                "speaker_match_probability": 0.0,
                "claimed_speaker_id": claimed_speaker or "UNREGISTERED",
                "embedding_distance": 1.0,
                "speaker_consistency_score": 0.0,
                "audio_anomaly_score": anomaly_score,
                "acoustic_pitch_std": pitch_std,
                "background_noise_snr": snr,
                "note": "Speaker verification could not be performed: no enrolled voiceprint reference available."
            }

        # If claimed speaker is registered, compare acoustics
        profile = ENROLLED_PROFILES[speaker_key]
        if audio_features:
            actual_pitch = audio_features.get("acoustic_pitch_std", 12.0)
            diff = abs(actual_pitch - profile["baseline_pitch_std"])
            match_prob = round(max(0.15, min(0.96, 1.0 - (diff / 15.0))), 2)
            anomaly_score = audio_features.get("audio_anomaly_score", 0.15)
            snr = audio_features.get("background_noise_snr", 30.0)
        else:
            match_prob = round(random.uniform(0.65, 0.95), 2)
            anomaly_score = round(max(0.0, min(1.0, 1.0 - match_prob)), 2)
            actual_pitch = profile["baseline_pitch_std"]
            snr = profile["baseline_snr"]

        is_matched = match_prob >= 0.70

        return {
            "matched": is_matched,
            "confidence": match_prob,
            "verification_status": "VERIFIED" if is_matched else "MISMATCH",
            "speaker_match_probability": match_prob,
            "claimed_speaker_id": claimed_speaker,
            "embedding_distance": round(1.0 - match_prob, 2),
            "speaker_consistency_score": round(match_prob * 100.0, 1),
            "audio_anomaly_score": anomaly_score,
            "acoustic_pitch_std": actual_pitch,
            "background_noise_snr": snr
        }
