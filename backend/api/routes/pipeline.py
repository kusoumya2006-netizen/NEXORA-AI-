# Pipeline router for unified NEXORA analysis

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.api.schemas.contracts import APIResponse, AnalyzeRequest
from backend.database.connection import get_db
from backend.services.nexora_pipeline import NexoraPipeline

router = APIRouter()

@router.post("/pipeline/analyze", response_model=APIResponse, status_code=status.HTTP_200_OK)
def pipeline_analyze(
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
):
    """Unified analysis endpoint.

    At least one of ``audio_b64`` or ``transcript`` must be supplied. The
    request is delegated to :class:`~backend.services.nexora_pipeline.NexoraPipeline`
    which orchestrates the existing adapters.
    """
    if not payload.audio_b64 and not payload.transcript:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either 'audio_b64' or 'transcript' must be provided.",
        )
    try:
        pipeline = NexoraPipeline()
        result = pipeline.analyze(
            db=db,
            session_id=payload.session_id,
            audio_b64=payload.audio_b64,
            transcript=payload.transcript,
            caller_claimed_identity=payload.caller_claimed_identity,
            caller_phone=payload.caller_phone,
            recipient_phone=payload.recipient_phone,
            preset_scenario=payload.preset_scenario,
            metadata=payload.metadata,
        )
        return APIResponse(success=True, data=result, error=None)
    except Exception as exc:
        # Log the exception (print for simplicity) and return a generic error
        print(f"[NEXORA PIPELINE ERROR] {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
