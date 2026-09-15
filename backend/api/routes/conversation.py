from fastapi import APIRouter
from backend.api.schemas.contracts import APIResponse, ConversationAnalyzeRequest
from modules.conversation_risk.adapter import ConversationRiskAdapter
from backend.config import settings

router = APIRouter()

@router.post("/conversation/analyze", response_model=APIResponse)
def analyze_conversation(payload: ConversationAnalyzeRequest):
    adapter = ConversationRiskAdapter(mode=settings.MODEL_MODE)
    res = adapter.analyze_conversation(
        transcript=payload.transcript,
        metadata=payload.metadata
    )
    return APIResponse(success=True, data=res, error=None)
