from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import ValidationError

from backend.database.connection import get_db
from backend.api.schemas.contracts import APIResponse, AnalyzeRequest
from backend.services.nexora_pipeline import NexoraPipeline
from backend.services.audio_processor import AudioProcessingError

router = APIRouter()

@router.post("/analyze", response_model=APIResponse)
async def analyze_call(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Central NEXORA Threat Analysis Intercept Endpoint.
    Supports both:
    1. application/json (AnalyzeRequest schema)
    2. multipart/form-data (Audio file upload with optional metadata fields)
    """
    content_type = request.headers.get("content-type", "")

    session_id = None
    audio_bytes = None
    audio_b64 = None
    audio_filename = None
    audio_content_type = None
    transcript = None
    caller_claimed_identity = None
    caller_phone = None
    recipient_phone = None
    preset_scenario = None
    metadata = {}

    if "multipart/form-data" in content_type:
        form = await request.form()
        uploaded_file = form.get("audio") or form.get("file") or form.get("audio_file")
        if uploaded_file and hasattr(uploaded_file, "read"):
            audio_bytes = await uploaded_file.read()
            audio_filename = getattr(uploaded_file, "filename", "audio.wav")
            audio_content_type = getattr(uploaded_file, "content_type", "audio/wav")

        transcript = form.get("transcript")
        caller_claimed_identity = form.get("caller_claimed_identity")
        caller_phone = form.get("caller_phone")
        recipient_phone = form.get("recipient_phone")
        preset_scenario = form.get("preset_scenario")
        session_id = form.get("session_id")
        audio_b64 = form.get("audio_b64")
    else:
        try:
            body = await request.json()
            payload = AnalyzeRequest(**body)
            session_id = payload.session_id
            audio_b64 = payload.audio_b64
            transcript = payload.transcript
            caller_claimed_identity = payload.caller_claimed_identity
            caller_phone = payload.caller_phone
            recipient_phone = payload.recipient_phone
            preset_scenario = payload.preset_scenario
            metadata = payload.metadata or {}
        except ValidationError as ve:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=ve.errors())
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid JSON request: {str(e)}")

    if not audio_bytes and not audio_b64 and not transcript and not preset_scenario:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either audio file/data, transcript, or an attack preset scenario must be provided."
        )

    try:
        pipeline = NexoraPipeline()
        result = pipeline.analyze(
            db=db,
            session_id=session_id,
            audio_bytes=audio_bytes,
            audio_b64=audio_b64,
            audio_filename=audio_filename,
            audio_content_type=audio_content_type,
            transcript=transcript,
            caller_claimed_identity=caller_claimed_identity,
            caller_phone=caller_phone,
            recipient_phone=recipient_phone,
            preset_scenario=preset_scenario,
            metadata=metadata,
            persist=True
        )
        return APIResponse(success=True, data=result, error=None)
    except AudioProcessingError as ape:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=ape.message)
    except Exception as exc:
        print(f"[NEXORA Analyze Error] {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
