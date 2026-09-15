import base64
import datetime
import random
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.config import settings
from backend.services.audio_processor import AudioProcessor, AudioProcessingError
from backend.services.transcription import TranscriptionService
from modules.voice_detection.adapter import VoiceDetectionAdapter
from modules.speaker_analysis.adapter import SpeakerAnalysisAdapter
from modules.conversation_risk.adapter import ConversationRiskAdapter
from modules.security_response.adapter import SecurityResponseAdapter
from backend.services.risk_engine import DynamicRiskEngine
from backend.database.models import (
    Call, AnalysisResult, VoiceAnalysis, SpeakerAnalysis,
    ConversationAnalysis, RiskAssessment, Alert, SecurityAction, AuditLog
)

class NexoraPipeline:
    """
    Central NEXORA Threat Detection & Response Pipeline.
    Orchestrates:
    Audio Ingestion & Preprocessing -> Voice Deepfake Detection -> Speaker Verification ->
    Audio Feature Extraction -> Speech-To-Text Transcription -> Intent/Conversation Risk ->
    Dynamic Multi-Factor Risk Fusion -> Automated Security Decision -> Database Persistence.
    """

    def __init__(self, mode: str = settings.MODEL_MODE):
        self.mode = mode
        self.voice_adapter = VoiceDetectionAdapter(mode=mode)
        self.speaker_adapter = SpeakerAnalysisAdapter(mode=mode)
        self.conversation_adapter = ConversationRiskAdapter(mode=mode)
        self.security_adapter = SecurityResponseAdapter(mode=mode)

    def analyze(
        self,
        db: Optional[Session] = None,
        session_id: Optional[str] = None,
        audio_bytes: Optional[bytes] = None,
        audio_b64: Optional[str] = None,
        audio_filename: Optional[str] = None,
        audio_content_type: Optional[str] = None,
        transcript: Optional[str] = None,
        caller_claimed_identity: Optional[str] = None,
        caller_phone: Optional[str] = None,
        recipient_phone: Optional[str] = None,
        preset_scenario: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        persist: bool = True
    ) -> Dict[str, Any]:
        metadata = dict(metadata or {})
        if preset_scenario:
            metadata["preset_scenario"] = preset_scenario

        call_id = session_id or f"NX-{random.randint(10000, 99999)}"
        timestamp = datetime.datetime.now(datetime.timezone.utc)

        # 1. Audio Preprocessing & Acoustic Feature Extraction
        audio_features = None
        raw_audio = audio_bytes

        if not raw_audio and audio_b64:
            try:
                # Handle base64 data URLs if present (e.g. data:audio/wav;base64,...)
                b64_str = audio_b64
                if "," in b64_str:
                    b64_str = b64_str.split(",", 1)[1]
                raw_audio = base64.b64decode(b64_str)
            except Exception:
                raw_audio = None

        if raw_audio:
            try:
                audio_features = AudioProcessor.validate_and_preprocess(
                    audio_bytes=raw_audio,
                    filename=audio_filename,
                    content_type=audio_content_type
                )
                metadata["audio_features"] = audio_features
            except AudioProcessingError:
                raise
            except Exception as e:
                # Graceful degradation for audio feature extraction
                audio_features = {
                    "is_valid": False,
                    "error": str(e),
                    "duration_seconds": 15.0,
                    "audio_anomaly_score": 0.2
                }
                metadata["audio_features"] = audio_features

        # 2. Speech-To-Text Transcription
        transcription_res = TranscriptionService.transcribe(
            audio_features=audio_features,
            raw_audio=raw_audio,
            existing_transcript=transcript,
            preset_scenario=preset_scenario
        )
        effective_transcript = transcription_res.get("text", "") or (transcript or "")

        # 3. Voice Deepfake Authenticity Detection
        voice_res = self.voice_adapter.detect_authenticity(
            audio_data=raw_audio or audio_b64,
            metadata=metadata
        )

        # 4. Speaker Verification & Acoustic Biometrics
        speaker_res = self.speaker_adapter.verify_speaker(
            audio_data=raw_audio or audio_b64,
            claimed_speaker=caller_claimed_identity,
            metadata=metadata
        )

        # 5. Conversation & Intent Analysis
        conv_res = self.conversation_adapter.analyze_conversation(
            transcript=effective_transcript,
            metadata=metadata
        )

        # 6. Dynamic Multi-Factor Risk Fusion
        risk_res = DynamicRiskEngine.calculate_risk(
            voice_res=voice_res,
            speaker_res=speaker_res,
            conversation_res=conv_res
        )

        # 7. Automated Security Response Action
        sec_res = self.security_adapter.execute_response(
            risk_level=risk_res["risk_level"],
            call_id=call_id,
            context={"risk": risk_res, "preset": preset_scenario}
        )

        # 8. Database Persistence (Audit logging and SOC history)
        if persist and db is not None:
            try:
                self._persist_to_database(
                    db=db,
                    call_id=call_id,
                    caller_phone=caller_phone,
                    recipient_phone=recipient_phone,
                    caller_claimed_identity=caller_claimed_identity,
                    duration_seconds=audio_features.get("duration_seconds", 45) if audio_features else 45,
                    transcript=effective_transcript,
                    timestamp=timestamp,
                    voice_res=voice_res,
                    speaker_res=speaker_res,
                    conv_res=conv_res,
                    risk_res=risk_res,
                    sec_res=sec_res
                )
            except Exception as dbe:
                print(f"[NEXORA Pipeline DB Persistence Warning] {dbe}")
                try:
                    db.rollback()
                except Exception:
                    pass

        return {
            "session_id": call_id,
            "call_id": call_id,
            "timestamp": timestamp.isoformat(),
            "model_mode": self.mode,
            "risk_score": risk_res["risk_score"],
            "risk_level": risk_res["risk_level"],
            "reasons": risk_res["reasons"],
            "recommended_action": risk_res["recommended_action"],
            "audio_features": audio_features,
            "transcription": transcription_res,
            "transcript": effective_transcript,
            "voice_analysis": voice_res,
            "speaker_verification": speaker_res,
            "conversation_analysis": conv_res,
            "security_response": sec_res
        }

    def _persist_to_database(
        self,
        db: Session,
        call_id: str,
        caller_phone: Optional[str],
        recipient_phone: Optional[str],
        caller_claimed_identity: Optional[str],
        duration_seconds: int,
        transcript: str,
        timestamp: datetime.datetime,
        voice_res: Dict[str, Any],
        speaker_res: Dict[str, Any],
        conv_res: Dict[str, Any],
        risk_res: Dict[str, Any],
        sec_res: Dict[str, Any]
    ):
        call_obj = db.query(Call).filter(Call.id == call_id).first()
        if not call_obj:
            call_obj = Call(
                id=call_id,
                caller_phone=caller_phone or "+1 (555) 019-4820",
                recipient_phone=recipient_phone or "+1 (800) 555-0199",
                caller_claimed_identity=caller_claimed_identity or "Unknown Caller",
                duration_seconds=int(duration_seconds),
                channel="VOIP_INBOUND",
                status="COMPLETED",
                transcript=transcript,
                timestamp=timestamp
            )
            db.add(call_obj)
            db.flush()

        analysis_res = AnalysisResult(
            id=f"res_{call_id}_{uuid.uuid4().hex[:6]}",
            call_id=call_id,
            created_at=timestamp,
            model_mode=self.mode
        )
        db.add(analysis_res)
        db.flush()

        v_analysis = VoiceAnalysis(
            id=f"va_{uuid.uuid4().hex[:8]}",
            analysis_result_id=analysis_res.id,
            is_synthetic=voice_res.get("is_synthetic", False),
            synthetic_probability=voice_res.get("synthetic_probability", 0.0),
            voice_authenticity_score=voice_res.get("voice_authenticity_score", 100.0),
            spectral_artifacts_detected=voice_res.get("spectral_artifacts", []),
            model_name=voice_res.get("model_name", "NEXORA-VoiceNet-v2")
        )
        db.add(v_analysis)

        s_analysis = SpeakerAnalysis(
            id=f"sa_{uuid.uuid4().hex[:8]}",
            analysis_result_id=analysis_res.id,
            speaker_match_probability=speaker_res.get("speaker_match_probability", 1.0),
            claimed_speaker_id=speaker_res.get("claimed_speaker_id"),
            embedding_distance=speaker_res.get("embedding_distance", 0.1),
            speaker_consistency_score=speaker_res.get("speaker_consistency_score", 95.0),
            audio_anomaly_score=speaker_res.get("audio_anomaly_score", 0.05),
            acoustic_pitch_std=speaker_res.get("acoustic_pitch_std", 12.0),
            background_noise_snr=speaker_res.get("background_noise_snr", 30.0)
        )
        db.add(s_analysis)

        c_analysis = ConversationAnalysis(
            id=f"ca_{uuid.uuid4().hex[:8]}",
            analysis_result_id=analysis_res.id,
            intent_category=conv_res.get("intent_category", "INFORMATIONAL"),
            urgency_level=conv_res.get("urgency_level", "LOW"),
            suspicious_keywords=conv_res.get("suspicious_keywords", []),
            coercion_probability=conv_res.get("coercion_probability", 0.0),
            conversation_risk_score=conv_res.get("conversation_risk_score", 0.0)
        )
        db.add(c_analysis)

        risk_ass = RiskAssessment(
            id=f"ra_{uuid.uuid4().hex[:8]}",
            call_id=call_id,
            risk_score=risk_res.get("risk_score", 0),
            risk_level=risk_res.get("risk_level", "LOW"),
            reasons=risk_res.get("reasons", []),
            recommended_action=risk_res.get("recommended_action", "ALLOW"),
            created_at=timestamp
        )
        db.add(risk_ass)

        sec_act = SecurityAction(
            id=f"sec_{uuid.uuid4().hex[:8]}",
            call_id=call_id,
            action_type=sec_res.get("action_type", "ALLOW"),
            hold_transaction=sec_res.get("hold_transaction", False),
            mfa_challenge_sent=sec_res.get("mfa_challenge_sent", False),
            callback_requested=sec_res.get("callback_requested", False),
            execution_status=sec_res.get("execution_status", "EXECUTED"),
            details=sec_res.get("details", {}),
            timestamp=timestamp
        )
        db.add(sec_act)

        # Create alert for elevated threat
        if risk_res.get("risk_score", 0) >= 50:
            alert_obj = Alert(
                id=f"alt_{uuid.uuid4().hex[:8]}",
                call_id=call_id,
                severity=risk_res.get("risk_level", "HIGH"),
                title=f"Impersonation Threat: {conv_res.get("intent_category", "ALERT").replace("_", " ")}",
                description=f"Voice clone confidence {int(voice_res.get("synthetic_probability", 0)*100)}%. Risk score {risk_res.get("risk_score", 0)}/100.",
                status="ACTIVE",
                created_at=timestamp
            )
            db.add(alert_obj)

        # Audit Logs
        db.add(AuditLog(
            id=f"aud_{uuid.uuid4().hex[:8]}",
            call_id=call_id,
            event_type="ANALYSIS_COMPLETED",
            severity="INFO",
            actor="NEXORA_ORCHESTRATOR",
            details=f"Analysis pipeline executed for call {call_id} under mode {self.mode}",
            timestamp=timestamp
        ))

        db.add(AuditLog(
            id=f"aud_{uuid.uuid4().hex[:8]}",
            call_id=call_id,
            event_type="RISK_EVALUATED",
            severity="CRITICAL" if risk_res.get("risk_score", 0) >= 75 else "WARNING" if risk_res.get("risk_score", 0) >= 50 else "INFO",
            actor="NEXORA_RISK_ENGINE",
            details=f"Dynamic risk score {risk_res.get("risk_score", 0)}/100 [{risk_res.get("risk_level", "LOW")}] evaluated.",
            timestamp=timestamp
        ))

        if sec_res.get("hold_transaction"):
            db.add(AuditLog(
                id=f"aud_{uuid.uuid4().hex[:8]}",
                call_id=call_id,
                event_type="THREAT_BLOCKED",
                severity="CRITICAL",
                actor="NEXORA_SECURITY_SHIELD",
                details=f"Transaction hold & out-of-band verification challenge dispatched for session {call_id}.",
                timestamp=timestamp
            ))

        db.commit()
