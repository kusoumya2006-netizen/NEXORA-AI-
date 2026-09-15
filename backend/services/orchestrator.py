from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.config import settings
from backend.services.nexora_pipeline import NexoraPipeline

class AnalysisOrchestrator:
    """
    Central Orchestration Pipeline for NEXORA.
    Delegates to the unified NexoraPipeline engine.
    """
    def __init__(self, mode: str = settings.MODEL_MODE):
        self.mode = mode
        self.pipeline = NexoraPipeline(mode=mode)

    def process_analysis_request(
        self,
        db: Session,
        session_id: Optional[str] = None,
        audio_b64: Optional[str] = None,
        transcript: Optional[str] = None,
        caller_claimed_identity: Optional[str] = None,
        caller_phone: Optional[str] = None,
        recipient_phone: Optional[str] = None,
        preset_scenario: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return self.pipeline.analyze(
            db=db,
            session_id=session_id,
            audio_b64=audio_b64,
            transcript=transcript,
            caller_claimed_identity=caller_claimed_identity,
            caller_phone=caller_phone,
            recipient_phone=recipient_phone,
            preset_scenario=preset_scenario,
            metadata=metadata,
            persist=True
        )
