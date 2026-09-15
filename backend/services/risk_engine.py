from typing import Dict, Any, List

class DynamicRiskEngine:
    """
    NEXORA Dynamic Multi-Factor Risk Fusion Engine.
    Computes a transparent 0-100 risk score based on multi-factor analysis:
    - Voice Authenticity (Synthetic probability) - 35% weight
    - Speaker Verification (Speaker mismatch probability) - 25% weight
    - Conversation & Intent Analysis (Intent category & urgency) - 25% weight
    - Audio Acoustic Anomaly Score - 15% weight
    
    Risk Levels:
      0–29:  LOW      -> ALLOW
      30–59: MEDIUM   -> WARNING / FLAG
      60–79: HIGH     -> TRIGGER_SECONDARY_VERIFICATION
      80–100: CRITICAL -> BLOCK_AND_VERIFY
    """

    @staticmethod
    def calculate_risk(
        voice_res: Dict[str, Any],
        speaker_res: Dict[str, Any],
        conversation_res: Dict[str, Any]
    ) -> Dict[str, Any]:

        voice_fake_prob = voice_res.get("synthetic_probability", 0.0)
        speaker_match_prob = speaker_res.get("speaker_match_probability", 1.0)
        speaker_mismatch_prob = max(0.0, 1.0 - speaker_match_prob)
        conversation_risk_prob = conversation_res.get("conversation_risk_score", 0.0)
        audio_anomaly_prob = speaker_res.get("audio_anomaly_score", 0.0)

        # Base Weighted Score (0.0 to 1.0)
        w_voice = 0.35 * voice_fake_prob
        w_speaker = 0.25 * speaker_mismatch_prob
        w_conv = 0.25 * conversation_risk_prob
        w_audio = 0.15 * audio_anomaly_prob

        raw_score = (w_voice + w_speaker + w_conv + w_audio) * 100.0

        # Compounding Threat Amplification Rules
        reasons: List[str] = []

        if voice_fake_prob >= 0.75:
            reasons.append(f"Synthetic voice traits detected ({int(voice_fake_prob * 100)}% clone probability)")
            raw_score += 8
        elif voice_fake_prob >= 0.4:
            reasons.append(f"Elevated acoustic synthesis probability ({int(voice_fake_prob * 100)}%)")

        if speaker_match_prob <= 0.5:
            reasons.append(f"Speaker voiceprint mismatch ({int(speaker_match_prob * 100)}% biometric match)")
            raw_score += 6
        elif speaker_match_prob <= 0.75:
            reasons.append(f"Borderline speaker verification match ({int(speaker_match_prob * 100)}%)")

        intent = conversation_res.get("intent_category", "INFORMATIONAL")
        urgency = conversation_res.get("urgency_level", "LOW")

        if intent in ["FINANCIAL_TRANSFER", "OTP_HARVESTING", "ACCOUNT_TAKEOVER"]:
            reasons.append(f"High-risk intent category identified: {intent.replace("_", " ")}")
            raw_score += 10

        if urgency in ["HIGH", "CRITICAL"]:
            reasons.append(f"Coercive urgency tactics detected ({urgency} level)")

        if audio_anomaly_prob >= 0.6:
            reasons.append(f"High acoustic spectrum anomaly score ({int(audio_anomaly_prob * 100)}%)")

        # Clamp score to 0..100
        final_score = int(round(max(0.0, min(100.0, raw_score))))

        # Determine Risk Level & Recommended Action
        if final_score >= 80:
            risk_level = "CRITICAL"
            recommended_action = "BLOCK_AND_VERIFY"
        elif final_score >= 60:
            risk_level = "HIGH"
            recommended_action = "TRIGGER_SECONDARY_VERIFICATION"
        elif final_score >= 30:
            risk_level = "MEDIUM"
            recommended_action = "WARNING"
        else:
            risk_level = "LOW"
            recommended_action = "ALLOW"

        if not reasons:
            reasons.append("No abnormal voice, speaker, or intent risk indicators detected.")

        return {
            "risk_score": final_score,
            "risk_level": risk_level,
            "voice_fake_probability": round(voice_fake_prob, 2),
            "speaker_match_probability": round(speaker_match_prob, 2),
            "conversation_risk": round(conversation_risk_prob, 2),
            "audio_anomaly_score": round(audio_anomaly_prob, 2),
            "reasons": reasons,
            "recommended_action": recommended_action
        }
