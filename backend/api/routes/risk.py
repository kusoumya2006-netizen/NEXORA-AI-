from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import RiskAssessment
from backend.api.schemas.contracts import APIResponse, RiskScoreRequest
from backend.services.risk_engine import DynamicRiskEngine

router = APIRouter()

@router.post("/risk/score", response_model=APIResponse)
def compute_risk(payload: RiskScoreRequest):
    res = DynamicRiskEngine.calculate_risk(
        voice_res=payload.voice_analysis,
        speaker_res=payload.speaker_verification,
        conversation_res=payload.conversation_analysis
    )
    return APIResponse(success=True, data=res, error=None)

@router.get("/risk/{session_id}", response_model=APIResponse)
def get_session_risk(session_id: str, db: Session = Depends(get_db)):
    risk = db.query(RiskAssessment).filter(RiskAssessment.call_id == session_id).first()
    if not risk:
        raise HTTPException(status_code=404, detail="Risk assessment not found for session")
    return APIResponse(
        success=True,
        data={
            "session_id": risk.call_id,
            "risk_score": risk.risk_score,
            "risk_level": risk.risk_level,
            "reasons": risk.reasons,
            "recommended_action": risk.recommended_action,
            "created_at": risk.created_at.isoformat()
        },
        error=None
    )
