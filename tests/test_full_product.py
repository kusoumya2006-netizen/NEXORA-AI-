import io
import struct
import wave
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def create_dummy_wav(duration_s=1.0, freq=440.0, sample_rate=16000):
    """Generate a simple PCM 16-bit mono WAV in memory."""
    import math
    n_samples = int(duration_s * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        frames = bytearray()
        for i in range(n_samples):
            val = int(16000 * math.sin(2 * math.pi * freq * i / sample_rate))
            frames.extend(struct.pack("<h", val))
        wf.writeframes(frames)
    return buf.getvalue()

def test_root_health_and_api_v1_health():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["data"]["status"] == "HEALTHY"

    r2 = client.get("/api/v1/health")
    assert r2.status_code == 200
    assert r2.json()["data"]["status"] == "HEALTHY"

def test_audio_file_upload_multipart():
    wav_bytes = create_dummy_wav(duration_s=1.5, freq=300.0)
    files = {"file": ("call_sample.wav", wav_bytes, "audio/wav")}
    data = {
        "caller_claimed_identity": "Marcus Vance",
        "caller_phone": "+15550192834",
        "preset_scenario": "FINANCIAL_TRANSFER_ATTACK"
    }
    response = client.post("/api/v1/analyze", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "audio_features" in data
    assert data["audio_features"]["is_valid"] is True
    assert data["audio_features"]["duration_seconds"] > 1.0
    assert data["risk_level"] == "CRITICAL"
    assert data["security_response"]["hold_transaction"] is True

def test_audio_corrupted_handling():
    # Send random corrupt non-audio bytes
    corrupt_bytes = b"CORRUPTED_NOT_A_REAL_AUDIO_HEADER_XYZ12345"
    files = {"file": ("corrupt.wav", corrupt_bytes, "audio/wav")}
    response = client.post("/api/v1/analyze", files=files)
    assert response.status_code == 422
    assert "Corrupted" in response.json()["detail"] or "Unsupported" in response.json()["detail"]

def test_speaker_verification_unregistered_speaker():
    # If a caller has no enrolled voiceprint, verification must clearly report it
    wav_bytes = create_dummy_wav(duration_s=1.0)
    files = {"file": ("unknown_caller.wav", wav_bytes, "audio/wav")}
    data = {
        "caller_claimed_identity": "Random Stranded Stranger",
        "transcript": "Hello I need some assistance with office directions."
    }
    response = client.post("/api/v1/analyze", files=files, data=data)
    assert response.status_code == 200
    speaker_data = response.json()["data"]["speaker_verification"]
    assert speaker_data["verification_status"] == "NO_REFERENCE_ENROLLED"
    assert speaker_data["matched"] is False

def test_dashboard_api_endpoints_v1():
    r_sum = client.get("/api/v1/dashboard/summary")
    assert r_sum.status_code == 200
    assert "total_calls" in r_sum.json()["data"]

    r_calls = client.get("/api/v1/calls")
    assert r_calls.status_code == 200
    assert isinstance(r_calls.json()["data"], list)

    r_alerts = client.get("/api/v1/alerts")
    assert r_alerts.status_code == 200

    r_audit = client.get("/api/v1/audit")
    assert r_audit.status_code == 200
