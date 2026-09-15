# NEXORA — AI-Powered Real-Time Voice Impersonation Defense Platform

**Smart India Hackathon 2026 (SIH26104)**  
*AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks*

---

## 🛡️ Project Overview

NEXORA is an end-to-end cyber-defense platform built to detect, intercept, and neutralize voice-cloning and deepfake impersonation attacks across telephony and VoIP communication channels. 

Unlike standalone deepfake audio detectors, NEXORA operates as an active security shield combining **multi-factor biometric, acoustic, and behavioral threat analysis**:

```
Incoming Audio / Call
        ↓
Audio Ingestion & Preprocessing (WAV, MP3, FLAC, M4A validation, RMS, ZCR, SNR)
        ↓
Voice Authenticity Detection (Neural vocoder artifacts, synthetic glottal pulse shaping)
        ↓
Speaker Verification (Voiceprint matching against registered reference profiles)
        ↓
Audio Acoustic Analysis (Pitch std dev, spectral flatness, SNR consistency)
        ↓
Speech-to-Text Transcription (Acoustic transcription & conversation extraction)
        ↓
Conversation & Intent Analysis (NLP coercion tactics, financial/credential theft)
        ↓
Dynamic Multi-Factor Risk Engine (Transparent 0–100 risk scoring & compounding threat amplification)
        ↓
Final Security Decision (ALLOW | WARNING | TRIGGER_SECONDARY_VERIFICATION | BLOCK_AND_VERIFY)
        ↓
Automated Security Response (Transaction hold, out-of-band MFA push, callback trigger)
        ↓
Audit Logging & SQLite Persistence (Immutable forensic audit records)
        ↓
NEXORA SOC Dashboard (Real-time live intercept, threat metrics, call investigation console)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- Backend API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health` (or `http://localhost:8000/api/v1/health`)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- SOC Dashboard: `http://localhost:5173`

### 4. Run Everything with One Command
```bash
chmod +x run_all.sh
./run_all.sh
```

---

## 📡 API Endpoints

| Method | Path | Description | Supported Input |
|---|---|---|---|
| `GET` | `/health`, `/api/health`, `/api/v1/health` | Health check & service readiness | None |
| `POST` | `/api/analyze`, `/api/v1/analyze` | Unified central analysis pipeline | `application/json` or `multipart/form-data` |
| `POST` | `/api/pipeline/analyze`, `/api/v1/pipeline/analyze` | Pipeline endpoint | `application/json` |
| `GET` | `/api/calls`, `/api/v1/calls` | List intercepted call sessions | None |
| `GET` | `/api/calls/{call_id}`, `/api/v1/analysis/{call_id}` | Full forensic detail for a call | Call ID path param |
| `GET` | `/api/dashboard/summary`, `/api/v1/dashboard/summary` | SOC summary metrics and risk distribution | None |
| `GET` | `/api/alerts`, `/api/v1/alerts` | Active high-risk alerts | Severity/status query |
| `GET` | `/api/audit`, `/api/v1/audit` | Forensic audit log trail | None |
| `GET` | `/api/risk/{session_id}`, `/api/v1/risk/{session_id}` | Assessed risk for a call session | Session ID path param |

---

## 🎙️ Audio Input & File Formats

NEXORA accepts audio through multiple modalities:
1. **Attack Scenario Presets** (Financial Transfer Attack, OTP Harvesting, Legitimate Call, Vendor Route Change)
2. **Audio File Upload** (`.wav`, `.mp3`, `.m4a`, `.flac`, `.ogg`, `.webm`) up to 25 MB
3. **Live Microphone Recording** (Real-time in-browser PCM capture via Web Audio API)

---

## 🧪 Testing

Run the complete test suite:
```bash
./venv/bin/pytest -q
```
**Current Test Status**: 17 tests passed (100% passing across health, adapters, pipeline endpoints, audio processing, error handling, and database integration).
