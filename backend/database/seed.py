import datetime
import uuid
from backend.database.connection import SessionLocal, Base, engine
from backend.database.models import (
    User, Call, AnalysisResult, VoiceAnalysis, SpeakerAnalysis,
    ConversationAnalysis, RiskAssessment, Alert, SecurityAction, AuditLog
)

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_database():
    init_db()
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Call).first():
            print("[NEXORA DB] Database already contains seed data.")
            return

        print("[NEXORA DB] Seeding database with initial SIH demo data...")

        # Create Default Analyst User
        analyst = User(
            id="usr_admin01",
            username="sih_soc_analyst",
            email="security@nexora.ai",
            role="lead_soc_analyst"
        )
        db.add(analyst)

        # Seed Call Presets
        seed_calls = [
            {
                "id": "NX-10482",
                "caller_phone": "+1 (555) 019-2834",
                "recipient_phone": "+1 (800) 555-0199",
                "caller_claimed_identity": "CEO - Marcus Vance",
                "duration_seconds": 64,
                "channel": "VOIP_INBOUND",
                "status": "COMPLETED",
                "transcript": "Hello, this is Marcus. I'm currently trapped in a meeting with overseas investors and need you to urgently execute an immediate wire transfer of $250,000 to account 4829103849 right now. Do not delay, bypass standard secondary clearance!",
                "timestamp": datetime.datetime.utcnow() - datetime.timedelta(minutes=14),
                "voice": {
                    "is_synthetic": True,
                    "synthetic_probability": 0.94,
                    "voice_authenticity_score": 6.0,
                    "spectral_artifacts": ["Neural vocoder high-frequency phase anomaly", "Unnatural formant transition slope", "Synthetic pitch floor consistency"]
                },
                "speaker": {
                    "speaker_match_probability": 0.38,
                    "claimed_speaker_id": "spk_ceo_marcus",
                    "embedding_distance": 0.82,
                    "speaker_consistency_score": 38.0,
                    "audio_anomaly_score": 0.86,
                    "acoustic_pitch_std": 2.1,
                    "background_noise_snr": 42.1
                },
                "conversation": {
                    "intent_category": "FINANCIAL_TRANSFER",
                    "urgency_level": "CRITICAL",
                    "suspicious_keywords": ["urgently execute", "immediate wire transfer", "$250,000", "bypass standard secondary clearance"],
                    "coercion_probability": 0.91,
                    "conversation_risk_score": 0.95
                },
                "risk": {
                    "risk_score": 93,
                    "risk_level": "CRITICAL",
                    "reasons": [
                        "Synthetic voice characteristics detected (94% confidence)",
                        "Voiceprint mismatch against biometric template of Marcus Vance (38% similarity)",
                        "High-risk wire transfer request with urgency pressure and protocol bypass demands"
                    ],
                    "recommended_action": "BLOCK_AND_VERIFY"
                },
                "security": {
                    "action_type": "BLOCK_AND_VERIFY",
                    "hold_transaction": True,
                    "mfa_challenge_sent": True,
                    "callback_requested": True,
                    "details": {"hold_amount": "$250,000", "target_account": "4829103849", "flag_reason": "Voice Clone Impersonation"}
                },
                "alert": {
                    "severity": "CRITICAL",
                    "title": "Voice Clone Financial Attack Intercepted",
                    "description": "Deepfake voice cloning attack impersonating Marcus Vance attempting unauthorized $250,000 wire transfer.",
                    "status": "ACTIVE"
                }
            },
            {
                "id": "NX-10481",
                "caller_phone": "+1 (555) 014-9921",
                "recipient_phone": "+1 (800) 555-0199",
                "caller_claimed_identity": "VP Finance - Sarah Jenkins",
                "duration_seconds": 42,
                "channel": "VOIP_INBOUND",
                "status": "COMPLETED",
                "transcript": "Hi team, I lost my authenticator device during transit. Please read out the 6-digit SMS verification code sent to your terminal so I can log back into corporate banking.",
                "timestamp": datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=20),
                "voice": {
                    "is_synthetic": True,
                    "synthetic_probability": 0.81,
                    "voice_authenticity_score": 19.0,
                    "spectral_artifacts": ["Synthetic glottal pulse shaping", "Phase discontinuity at phrase boundaries"]
                },
                "speaker": {
                    "speaker_match_probability": 0.45,
                    "claimed_speaker_id": "spk_vp_sarah",
                    "embedding_distance": 0.69,
                    "speaker_consistency_score": 45.0,
                    "audio_anomaly_score": 0.74,
                    "acoustic_pitch_std": 4.5,
                    "background_noise_snr": 38.0
                },
                "conversation": {
                    "intent_category": "OTP_HARVESTING",
                    "urgency_level": "HIGH",
                    "suspicious_keywords": ["authenticator device", "6-digit SMS verification code", "corporate banking"],
                    "coercion_probability": 0.84,
                    "conversation_risk_score": 0.88
                },
                "risk": {
                    "risk_score": 79,
                    "risk_level": "CRITICAL",
                    "reasons": [
                        "Synthetic voice traits identified (81% clone confidence)",
                        "Credential/OTP harvest attempt detected"
                    ],
                    "recommended_action": "BLOCK_AND_VERIFY"
                },
                "security": {
                    "action_type": "BLOCK_AND_VERIFY",
                    "hold_transaction": True,
                    "mfa_challenge_sent": True,
                    "callback_requested": True,
                    "details": {"target": "SMS OTP Credential", "action": "Account locked pending callback"}
                },
                "alert": {
                    "severity": "HIGH",
                    "title": "OTP Credential Harvesting Attack Flagged",
                    "description": "Suspicious request for MFA verification tokens using synthesized voice.",
                    "status": "ACTIVE"
                }
            },
            {
                "id": "NX-10480",
                "caller_phone": "+1 (555) 018-3312",
                "recipient_phone": "+1 (800) 555-0199",
                "caller_claimed_identity": "IT Support - David Miller",
                "duration_seconds": 88,
                "channel": "VOIP_INBOUND",
                "status": "COMPLETED",
                "transcript": "Hello, this is David from IT support. We noticed unusual traffic on your workstation. Can you confirm if you recently initiated a password reset from a new IP in Singapore?",
                "timestamp": datetime.datetime.utcnow() - datetime.timedelta(hours=3, minutes=45),
                "voice": {
                    "is_synthetic": False,
                    "synthetic_probability": 0.12,
                    "voice_authenticity_score": 88.0,
                    "spectral_artifacts": []
                },
                "speaker": {
                    "speaker_match_probability": 0.91,
                    "claimed_speaker_id": "spk_it_david",
                    "embedding_distance": 0.12,
                    "speaker_consistency_score": 91.0,
                    "audio_anomaly_score": 0.08,
                    "acoustic_pitch_std": 14.2,
                    "background_noise_snr": 28.5
                },
                "conversation": {
                    "intent_category": "ROUTINE",
                    "urgency_level": "LOW",
                    "suspicious_keywords": [],
                    "coercion_probability": 0.05,
                    "conversation_risk_score": 0.10
                },
                "risk": {
                    "risk_score": 14,
                    "risk_level": "LOW",
                    "reasons": [
                        "Natural voice characteristics verified",
                        "High speaker embedding match (91%)"
                    ],
                    "recommended_action": "ALLOW"
                },
                "security": {
                    "action_type": "ALLOW",
                    "hold_transaction": False,
                    "mfa_challenge_sent": False,
                    "callback_requested": False,
                    "details": {"status": "Verified IT helpdesk call"}
                },
                "alert": None
            },
            {
                "id": "NX-10479",
                "caller_phone": "+1 (555) 012-7744",
                "recipient_phone": "+1 (800) 555-0199",
                "caller_claimed_identity": "Vendor Representative",
                "duration_seconds": 110,
                "channel": "VOIP_INBOUND",
                "status": "COMPLETED",
                "transcript": "Good morning. Calling from Acuity Logistics to follow up on invoice #8849. We updated our ABA routing number to Chase Manhattan, please confirm when payment is scheduled.",
                "timestamp": datetime.datetime.utcnow() - datetime.timedelta(hours=6, minutes=10),
                "voice": {
                    "is_synthetic": False,
                    "synthetic_probability": 0.38,
                    "voice_authenticity_score": 62.0,
                    "spectral_artifacts": ["Codec distortion artifact"]
                },
                "speaker": {
                    "speaker_match_probability": 0.62,
                    "claimed_speaker_id": "spk_vendor_acuity",
                    "embedding_distance": 0.41,
                    "speaker_consistency_score": 62.0,
                    "audio_anomaly_score": 0.39,
                    "acoustic_pitch_std": 9.8,
                    "background_noise_snr": 22.4
                },
                "conversation": {
                    "intent_category": "URGENT_VERIFICATION",
                    "urgency_level": "MEDIUM",
                    "suspicious_keywords": ["updated our ABA routing number", "invoice #8849"],
                    "coercion_probability": 0.42,
                    "conversation_risk_score": 0.48
                },
                "risk": {
                    "risk_score": 46,
                    "risk_level": "MEDIUM",
                    "reasons": [
                        "Moderate audio codec anomalies detected",
                        "Vendor bank account routing change request detected"
                    ],
                    "recommended_action": "TRIGGER_SECONDARY_VERIFICATION"
                },
                "security": {
                    "action_type": "TRIGGER_SECONDARY_VERIFICATION",
                    "hold_transaction": False,
                    "mfa_challenge_sent": True,
                    "callback_requested": True,
                    "details": {"out_of_band_call": "Scheduled vendor phone callback"}
                },
                "alert": {
                    "severity": "MEDIUM",
                    "title": "Vendor Banking Route Change Warning",
                    "description": "Call requested bank account detail update. Out-of-band callback initiated.",
                    "status": "RESOLVED"
                }
            }
        ]

        for item in seed_calls:
            call = Call(
                id=item["id"],
                caller_phone=item["caller_phone"],
                recipient_phone=item["recipient_phone"],
                caller_claimed_identity=item["caller_claimed_identity"],
                duration_seconds=item["duration_seconds"],
                channel=item["channel"],
                status=item["status"],
                transcript=item["transcript"],
                timestamp=item["timestamp"]
            )
            db.add(call)
            db.flush()

            analysis_res = AnalysisResult(
                id=f"res_{item['id']}",
                call_id=call.id,
                created_at=item["timestamp"],
                model_mode="mock"
            )
            db.add(analysis_res)
            db.flush()

            v_info = item["voice"]
            v_analysis = VoiceAnalysis(
                id=f"va_{item['id']}",
                analysis_result_id=analysis_res.id,
                is_synthetic=v_info["is_synthetic"],
                synthetic_probability=v_info["synthetic_probability"],
                voice_authenticity_score=v_info["voice_authenticity_score"],
                spectral_artifacts_detected=v_info["spectral_artifacts"],
                model_name="NEXORA-VoiceNet-v2"
            )
            db.add(v_analysis)

            s_info = item["speaker"]
            s_analysis = SpeakerAnalysis(
                id=f"sa_{item['id']}",
                analysis_result_id=analysis_res.id,
                speaker_match_probability=s_info["speaker_match_probability"],
                claimed_speaker_id=s_info["claimed_speaker_id"],
                embedding_distance=s_info["embedding_distance"],
                speaker_consistency_score=s_info["speaker_consistency_score"],
                audio_anomaly_score=s_info["audio_anomaly_score"],
                acoustic_pitch_std=s_info["acoustic_pitch_std"],
                background_noise_snr=s_info["background_noise_snr"]
            )
            db.add(s_analysis)

            c_info = item["conversation"]
            c_analysis = ConversationAnalysis(
                id=f"ca_{item['id']}",
                analysis_result_id=analysis_res.id,
                intent_category=c_info["intent_category"],
                urgency_level=c_info["urgency_level"],
                suspicious_keywords=c_info["suspicious_keywords"],
                coercion_probability=c_info["coercion_probability"],
                conversation_risk_score=c_info["conversation_risk_score"]
            )
            db.add(c_analysis)

            r_info = item["risk"]
            risk_ass = RiskAssessment(
                id=f"ra_{item['id']}",
                call_id=call.id,
                risk_score=r_info["risk_score"],
                risk_level=r_info["risk_level"],
                reasons=r_info["reasons"],
                recommended_action=r_info["recommended_action"],
                created_at=item["timestamp"]
            )
            db.add(risk_ass)

            sec_info = item["security"]
            sec_act = SecurityAction(
                id=f"sec_{item['id']}",
                call_id=call.id,
                action_type=sec_info["action_type"],
                hold_transaction=sec_info["hold_transaction"],
                mfa_challenge_sent=sec_info["mfa_challenge_sent"],
                callback_requested=sec_info["callback_requested"],
                execution_status="EXECUTED",
                details=sec_info["details"],
                timestamp=item["timestamp"]
            )
            db.add(sec_act)

            if item.get("alert"):
                a_info = item["alert"]
                alert_obj = Alert(
                    id=f"alt_{item['id']}",
                    call_id=call.id,
                    severity=a_info["severity"],
                    title=a_info["title"],
                    description=a_info["description"],
                    status=a_info["status"],
                    created_at=item["timestamp"]
                )
                db.add(alert_obj)

            # Audit log entries
            db.add(AuditLog(
                id=f"aud_1_{item['id']}",
                call_id=call.id,
                event_type="ANALYSIS_COMPLETED",
                severity="INFO",
                actor="NEXORA_ENGINE",
                details=f"Multi-layered voice and acoustic analysis completed for session {call.id}",
                timestamp=item["timestamp"]
            ))

            db.add(AuditLog(
                id=f"aud_2_{item['id']}",
                call_id=call.id,
                event_type="RISK_EVALUATED",
                severity="WARNING" if r_info["risk_score"] >= 50 else "INFO",
                actor="NEXORA_RISK_ENGINE",
                details=f"Dynamic Risk Engine computed score {r_info['risk_score']}/100 [{r_info['risk_level']}]",
                timestamp=item["timestamp"]
            ))

            if r_info["risk_score"] >= 75:
                db.add(AuditLog(
                    id=f"aud_3_{item['id']}",
                    call_id=call.id,
                    event_type="THREAT_BLOCKED",
                    severity="CRITICAL",
                    actor="NEXORA_SECURITY_SHIELD",
                    details=f"Security Shield triggered hold transaction & secondary MFA callback for call {call.id}",
                    timestamp=item["timestamp"]
                ))

        db.commit()
        print("[NEXORA DB] Database seed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[NEXORA DB] Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
