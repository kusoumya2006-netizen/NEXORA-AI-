from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database.connection import get_db
from backend.database.models import Call, RiskAssessment, Alert, SecurityAction, VoiceAnalysis, SpeakerAnalysis
from backend.api.schemas.contracts import APIResponse

router = APIRouter()

@router.get("/dashboard/summary", response_model=APIResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_calls = db.query(func.count(Call.id)).scalar() or 0
    suspicious_calls = db.query(func.count(RiskAssessment.id)).filter(RiskAssessment.risk_score >= 50).scalar() or 0
    critical_threats = db.query(func.count(RiskAssessment.id)).filter(RiskAssessment.risk_score >= 75).scalar() or 0
    avg_risk = db.query(func.avg(RiskAssessment.risk_score)).scalar() or 0.0
    blocked_sessions = db.query(func.count(SecurityAction.id)).filter(SecurityAction.hold_transaction == True).scalar() or 0
    verification_failures = db.query(func.count(SpeakerAnalysis.id)).filter(SpeakerAnalysis.speaker_match_probability < 0.6).scalar() or 0

    # Risk Distribution Breakdown
    low_count = db.query(func.count(RiskAssessment.id)).filter(RiskAssessment.risk_level == "LOW").scalar() or 0
    med_count = db.query(func.count(RiskAssessment.id)).filter(RiskAssessment.risk_level == "MEDIUM").scalar() or 0
    high_count = db.query(func.count(RiskAssessment.id)).filter(RiskAssessment.risk_level == "HIGH").scalar() or 0
    crit_count = db.query(func.count(RiskAssessment.id)).filter(RiskAssessment.risk_level == "CRITICAL").scalar() or 0

    return APIResponse(
        success=True,
        data={
            "total_calls": total_calls,
            "suspicious_calls": suspicious_calls,
            "critical_threats": critical_threats,
            "average_risk": round(avg_risk, 1),
            "blocked_sessions": blocked_sessions,
            "verification_failures": verification_failures,
            "risk_distribution": [
                {"name": "Low (0-24)", "value": low_count, "color": "#10b981"},
                {"name": "Medium (25-49)", "value": med_count, "color": "#f59e0b"},
                {"name": "High (50-74)", "value": high_count, "color": "#f97316"},
                {"name": "Critical (75-100)", "value": crit_count, "color": "#ef4444"}
            ]
        },
        error=None
    )
