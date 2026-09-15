from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_analyze_pipeline_end_to_end():
    payload = {
        "session_id": "NX-TEST-001",
        "caller_claimed_identity": "Marcus Vance",
        "caller_phone": "+15550192834",
        "transcript": "Execute immediate wire transfer of $250,000 urgently",
        "preset_scenario": "FINANCIAL_TRANSFER_ATTACK"
    }

    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    data = json_data["data"]
    
    assert data["session_id"] == "NX-TEST-001"
    assert data["risk_score"] >= 75
    assert data["risk_level"] == "CRITICAL"
    assert data["security_response"]["hold_transaction"] is True
    assert len(data["reasons"]) > 0

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "total_calls" in json_data["data"]
    assert json_data["data"]["total_calls"] > 0
