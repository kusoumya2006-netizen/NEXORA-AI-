from typing import Generic, TypeVar, Optional, Any, List, Dict
from pydantic import BaseModel, Field

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None

# Input schemas
class AnalyzeRequest(BaseModel):
    session_id: Optional[str] = None
    audio_b64: Optional[str] = None
    transcript: Optional[str] = None
    caller_claimed_identity: Optional[str] = None
    caller_phone: Optional[str] = None
    recipient_phone: Optional[str] = None
    preset_scenario: Optional[str] = None  # e.g. FINANCIAL_TRANSFER_ATTACK, OTP_HARVESTING, LEGITIMATE_CALL, ROUTINE_VENDOR
    metadata: Optional[Dict[str, Any]] = None

class VoiceDetectRequest(BaseModel):
    audio_b64: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SpeakerVerifyRequest(BaseModel):
    audio_b64: Optional[str] = None
    claimed_speaker_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AudioAnalyzeRequest(BaseModel):
    audio_b64: Optional[str] = None

class ConversationAnalyzeRequest(BaseModel):
    transcript: str
    metadata: Optional[Dict[str, Any]] = None

class RiskScoreRequest(BaseModel):
    voice_analysis: Dict[str, Any]
    speaker_verification: Dict[str, Any]
    conversation_analysis: Dict[str, Any]

class SecurityRespondRequest(BaseModel):
    call_id: str
    risk_level: str
    context: Optional[Dict[str, Any]] = None
