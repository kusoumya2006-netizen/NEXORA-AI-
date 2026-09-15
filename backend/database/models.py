import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String)
    role = Column(String, default="analyst")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Call(Base):
    __tablename__ = "calls"

    id = Column(String, primary_key=True, index=True) # e.g. NX-10482
    caller_phone = Column(String, nullable=True)
    recipient_phone = Column(String, nullable=True)
    caller_claimed_identity = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    duration_seconds = Column(Integer, default=45)
    channel = Column(String, default="VOIP_INBOUND")
    status = Column(String, default="COMPLETED") # LIVE, ANALYZING, COMPLETED
    transcript = Column(Text, nullable=True)

    analysis_results = relationship("AnalysisResult", back_populates="call", uselist=False, cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="call", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="call", cascade="all, delete-orphan")
    security_actions = relationship("SecurityAction", back_populates="call", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="call", cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    model_mode = Column(String, default="mock")

    call = relationship("Call", back_populates="analysis_results")
    voice_analysis = relationship("VoiceAnalysis", back_populates="analysis_result", uselist=False, cascade="all, delete-orphan")
    speaker_analysis = relationship("SpeakerAnalysis", back_populates="analysis_result", uselist=False, cascade="all, delete-orphan")
    conversation_analysis = relationship("ConversationAnalysis", back_populates="analysis_result", uselist=False, cascade="all, delete-orphan")


class VoiceAnalysis(Base):
    __tablename__ = "voice_analysis"

    id = Column(String, primary_key=True, index=True)
    analysis_result_id = Column(String, ForeignKey("analysis_results.id"), nullable=False)
    is_synthetic = Column(Boolean, default=False)
    synthetic_probability = Column(Float, default=0.0) # 0.0 to 1.0
    voice_authenticity_score = Column(Float, default=100.0) # 0.0 to 100.0
    spectral_artifacts_detected = Column(JSON, default=list) # e.g. ["Phase discontinuity", "Neural vocoder pitch glithes"]
    model_name = Column(String, default="NEXORA-VoiceNet-v2")

    analysis_result = relationship("AnalysisResult", back_populates="voice_analysis")


class SpeakerAnalysis(Base):
    __tablename__ = "speaker_analysis"

    id = Column(String, primary_key=True, index=True)
    analysis_result_id = Column(String, ForeignKey("analysis_results.id"), nullable=False)
    speaker_match_probability = Column(Float, default=1.0) # 0.0 to 1.0
    claimed_speaker_id = Column(String, nullable=True)
    embedding_distance = Column(Float, default=0.1)
    speaker_consistency_score = Column(Float, default=95.0)
    audio_anomaly_score = Column(Float, default=0.05) # 0.0 to 1.0
    acoustic_pitch_std = Column(Float, default=12.4)
    background_noise_snr = Column(Float, default=34.2)

    analysis_result = relationship("AnalysisResult", back_populates="speaker_analysis")


class ConversationAnalysis(Base):
    __tablename__ = "conversation_analysis"

    id = Column(String, primary_key=True, index=True)
    analysis_result_id = Column(String, ForeignKey("analysis_results.id"), nullable=False)
    intent_category = Column(String, default="INFORMATIONAL") # FINANCIAL_TRANSFER, OTP_HARVESTING, URGENT_VERIFICATION, ROUTINE
    urgency_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    suspicious_keywords = Column(JSON, default=list)
    coercion_probability = Column(Float, default=0.0)
    conversation_risk_score = Column(Float, default=0.0) # 0.0 to 1.0

    analysis_result = relationship("AnalysisResult", back_populates="conversation_analysis")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False)
    risk_score = Column(Integer, default=0) # 0 to 100
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    reasons = Column(JSON, default=list)
    recommended_action = Column(String, default="ALLOW")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    call = relationship("Call", back_populates="risk_assessment")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False)
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String)
    description = Column(Text)
    status = Column(String, default="ACTIVE") # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    call = relationship("Call", back_populates="alerts")


class SecurityAction(Base):
    __tablename__ = "security_actions"

    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=False)
    action_type = Column(String) # ALLOW, WARNING, TRIGGER_SECONDARY_VERIFICATION, BLOCK_AND_VERIFY
    hold_transaction = Column(Boolean, default=False)
    mfa_challenge_sent = Column(Boolean, default=False)
    callback_requested = Column(Boolean, default=False)
    execution_status = Column(String, default="EXECUTED")
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    call = relationship("Call", back_populates="security_actions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    call_id = Column(String, ForeignKey("calls.id"), nullable=True)
    event_type = Column(String) # ANALYSIS_COMPLETED, RISK_EVALUATED, THREAT_BLOCKED, ALERT_GENERATED
    severity = Column(String, default="INFO")
    actor = Column(String, default="NEXORA_ENGINE")
    details = Column(Text)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    call = relationship("Call", back_populates="audit_logs")
