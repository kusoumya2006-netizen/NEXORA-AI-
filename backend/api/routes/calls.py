from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import Call, AnalysisResult, VoiceAnalysis, SpeakerAnalysis, ConversationAnalysis, RiskAssessment, SecurityAction, AuditLog
from backend.api.schemas.contracts import APIResponse

router = APIRouter()

@router.get("/calls", response_model=APIResponse)
def list_calls(db: Session = Depends(get_db)):
    calls = db.query(Call).order_by(Call.timestamp.desc()).all()
    results = []

    for c in calls:
        r_ass = db.query(RiskAssessment).filter(RiskAssessment.call_id == c.id).first()
        sec = db.query(SecurityAction).filter(SecurityAction.call_id == c.id).first()
        results.append({
            "id": c.id,
            "caller_phone": c.caller_phone,
            "recipient_phone": c.recipient_phone,
            "caller_claimed_identity": c.caller_claimed_identity,
            "timestamp": c.timestamp.isoformat(),
            "duration_seconds": c.duration_seconds,
            "channel": c.channel,
            "status": c.status,
            "transcript": c.transcript,
            "risk_score": r_ass.risk_score if r_ass else 0,
            "risk_level": r_ass.risk_level if r_ass else "LOW",
            "recommended_action": r_ass.recommended_action if r_ass else "ALLOW",
            "action_type": sec.action_type if sec else "ALLOW",
            "hold_transaction": sec.hold_transaction if sec else False
        })

    return APIResponse(success=True, data=results, error=None)


@router.get("/calls/{call_id}", response_model=APIResponse)
@router.get("/analysis/{call_id}", response_model=APIResponse)
def get_call_detail(call_id: str, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call session not found")

    res = db.query(AnalysisResult).filter(AnalysisResult.call_id == call_id).first()
    v_analysis = db.query(VoiceAnalysis).filter(VoiceAnalysis.analysis_result_id == res.id).first() if res else None
    s_analysis = db.query(SpeakerAnalysis).filter(SpeakerAnalysis.analysis_result_id == res.id).first() if res else None
    c_analysis = db.query(ConversationAnalysis).filter(ConversationAnalysis.analysis_result_id == res.id).first() if res else None
    r_ass = db.query(RiskAssessment).filter(RiskAssessment.call_id == call_id).first()
    sec = db.query(SecurityAction).filter(SecurityAction.call_id == call_id).first()
    audits = db.query(AuditLog).filter(AuditLog.call_id == call_id).order_by(AuditLog.timestamp.asc()).all()

    return APIResponse(
        success=True,
        data={
            "call": {
                "id": call.id,
                "caller_phone": call.caller_phone,
                "recipient_phone": call.recipient_phone,
                "caller_claimed_identity": call.caller_claimed_identity,
                "timestamp": call.timestamp.isoformat(),
                "duration_seconds": call.duration_seconds,
                "channel": call.channel,
                "status": call.status,
                "transcript": call.transcript
            },
            "voice_analysis": {
                "is_synthetic": v_analysis.is_synthetic if v_analysis else False,
                "synthetic_probability": v_analysis.synthetic_probability if v_analysis else 0.0,
                "voice_authenticity_score": v_analysis.voice_authenticity_score if v_analysis else 100.0,
                "spectral_artifacts": v_analysis.spectral_artifacts_detected if v_analysis else [],
                "model_name": v_analysis.model_name if v_analysis else "NEXORA-VoiceNet-v2"
            } if v_analysis else None,
            "speaker_verification": {
                "speaker_match_probability": s_analysis.speaker_match_probability if s_analysis else 1.0,
                "claimed_speaker_id": s_analysis.claimed_speaker_id if s_analysis else None,
                "embedding_distance": s_analysis.embedding_distance if s_analysis else 0.0,
                "speaker_consistency_score": s_analysis.speaker_consistency_score if s_analysis else 100.0,
                "audio_anomaly_score": s_analysis.audio_anomaly_score if s_analysis else 0.0,
                "acoustic_pitch_std": s_analysis.acoustic_pitch_std if s_analysis else 12.0,
                "background_noise_snr": s_analysis.background_noise_snr if s_analysis else 30.0
            } if s_analysis else None,
            "conversation_analysis": {
                "intent_category": c_analysis.intent_category if c_analysis else "INFORMATIONAL",
                "urgency_level": c_analysis.urgency_level if c_analysis else "LOW",
                "suspicious_keywords": c_analysis.suspicious_keywords if c_analysis else [],
                "coercion_probability": c_analysis.coercion_probability if c_analysis else 0.0,
                "conversation_risk_score": c_analysis.conversation_risk_score if c_analysis else 0.0
            } if c_analysis else None,
            "risk_assessment": {
                "risk_score": r_ass.risk_score if r_ass else 0,
                "risk_level": r_ass.risk_level if r_ass else "LOW",
                "reasons": r_ass.reasons if r_ass else [],
                "recommended_action": r_ass.recommended_action if r_ass else "ALLOW"
            } if r_ass else None,
            "security_action": {
                "action_type": sec.action_type if sec else "ALLOW",
                "hold_transaction": sec.hold_transaction if sec else False,
                "mfa_challenge_sent": sec.mfa_challenge_sent if sec else False,
                "callback_requested": sec.callback_requested if sec else False,
                "execution_status": sec.execution_status if sec else "EXECUTED",
                "details": sec.details if sec else {}
            } if sec else None,
            "audit_trail": [
                {
                    "id": a.id,
                    "event_type": a.event_type,
                    "severity": a.severity,
                    "actor": a.actor,
                    "details": a.details,
                    "timestamp": a.timestamp.isoformat()
                } for a in audits
            ]
        },
        error=None
    )
