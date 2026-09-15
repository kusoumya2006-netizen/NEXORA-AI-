from modules.voice_detection.adapter import VoiceDetectionAdapter
from modules.speaker_analysis.adapter import SpeakerAnalysisAdapter
from modules.conversation_risk.adapter import ConversationRiskAdapter
from modules.security_response.adapter import SecurityResponseAdapter
from backend.services.risk_engine import DynamicRiskEngine

def test_voice_adapter():
    adapter = VoiceDetectionAdapter(mode="mock")
    res = adapter.detect_authenticity(metadata={"preset_scenario": "FINANCIAL_TRANSFER_ATTACK"})
    assert res["is_synthetic"] is True
    assert res["synthetic_probability"] >= 0.9

def test_speaker_adapter():
    adapter = SpeakerAnalysisAdapter(mode="mock")
    res = adapter.verify_speaker(claimed_speaker="spk_ceo_marcus", metadata={"preset_scenario": "FINANCIAL_TRANSFER_ATTACK"})
    assert res["speaker_match_probability"] <= 0.5

def test_conversation_adapter():
    adapter = ConversationRiskAdapter(mode="mock")
    res = adapter.analyze_conversation(transcript="Please execute an immediate wire transfer urgently", metadata={"preset_scenario": "FINANCIAL_TRANSFER_ATTACK"})
    assert res["intent_category"] == "FINANCIAL_TRANSFER"
    assert res["urgency_level"] == "CRITICAL"

def test_risk_engine():
    v = {"synthetic_probability": 0.94}
    s = {"speaker_match_probability": 0.38, "audio_anomaly_score": 0.86}
    c = {"intent_category": "FINANCIAL_TRANSFER", "urgency_level": "CRITICAL", "conversation_risk_score": 0.95}
    
    risk = DynamicRiskEngine.calculate_risk(v, s, c)
    assert risk["risk_score"] >= 75
    assert risk["risk_level"] == "CRITICAL"
    assert risk["recommended_action"] == "BLOCK_AND_VERIFY"

def test_security_adapter():
    adapter = SecurityResponseAdapter(mode="mock")
    res = adapter.execute_response(risk_level="CRITICAL", call_id="NX-99999")
    assert res["hold_transaction"] is True
    assert res["mfa_challenge_sent"] is True
