from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import Alert
from backend.api.schemas.contracts import APIResponse

router = APIRouter()

@router.get("/alerts", response_model=APIResponse)
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by LOW, MEDIUM, HIGH, CRITICAL"),
    status: Optional[str] = Query(None, description="Filter by ACTIVE, ACKNOWLEDGED, RESOLVED"),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if status:
        query = query.filter(Alert.status == status.upper())

    alerts = query.order_by(Alert.created_at.desc()).all()

    data = [
        {
            "id": a.id,
            "call_id": a.call_id,
            "severity": a.severity,
            "title": a.title,
            "description": a.description,
            "status": a.status,
            "created_at": a.created_at.isoformat()
        } for a in alerts
    ]

    return APIResponse(success=True, data=data, error=None)
