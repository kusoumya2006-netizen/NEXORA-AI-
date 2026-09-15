from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import AuditLog
from backend.api.schemas.contracts import APIResponse

router = APIRouter()

@router.get("/audit-logs", response_model=APIResponse)
@router.get("/audit", response_model=APIResponse)
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()

    data = [
        {
            "id": l.id,
            "call_id": l.call_id,
            "event_type": l.event_type,
            "severity": l.severity,
            "actor": l.actor,
            "details": l.details,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat()
        } for l in logs
    ]

    return APIResponse(success=True, data=data, error=None)
