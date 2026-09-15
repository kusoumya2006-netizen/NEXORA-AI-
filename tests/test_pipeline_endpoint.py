import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

@pytest.mark.parametrize(
    "preset,expected_level",
    [
        ("FINANCIAL_TRANSFER_ATTACK", "CRITICAL"),
        ("LEGITIMATE_CALL", "LOW"),
    ],
)
def test_pipeline_success(preset, expected_level):
    payload = {
        "preset_scenario": preset,
        "audio_b64": None,
        "transcript": "Test transcript for scenario",
    }
    response = client.post("/api/pipeline/analyze", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert data["risk_level"] == expected_level
    # basic sanity checks for unified response fields
    assert "voice_analysis" in data
    assert "speaker_verification" in data
    assert "conversation_analysis" in data
    assert "security_response" in data

def test_pipeline_missing_input():
    payload = {"preset_scenario": "FINANCIAL_TRANSFER_ATTACK"}
    response = client.post("/api/pipeline/analyze", json=payload)
    assert response.status_code == 422
    json_data = response.json()
    assert json_data["detail"] == "Either 'audio_b64' or 'transcript' must be provided."

def test_pipeline_adapter_failure(monkeypatch):
    # Force voice adapter to raise an exception
    def broken_detect_authenticity(*args, **kwargs):
        raise RuntimeError("simulated failure")
    from modules.voice_detection.adapter import VoiceDetectionAdapter
    monkeypatch.setattr(VoiceDetectionAdapter, "detect_authenticity", broken_detect_authenticity)
    payload = {"preset_scenario": "FINANCIAL_TRANSFER_ATTACK", "transcript": "test"}
    response = client.post("/api/pipeline/analyze", json=payload)
    assert response.status_code == 500
    json_data = response.json()
    assert "simulated failure" in json_data["detail"]
