from typing import Dict, Any, List

class ConversationRiskAdapter:
    """
    Adapter interface for Conversation & Intent Analysis Module.
    Extracts high-risk intent keywords, coercion signals, and returns intent category & conversation risk.
    """
    def __init__(self, mode: str = "mock"):
        self.mode = mode

    def analyze_conversation(self, transcript: str = "", metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        metadata = metadata or {}
        preset = metadata.get("preset_scenario")
        transcript_lower = (transcript or "").lower()

        if preset == "FINANCIAL_TRANSFER_ATTACK" or ("wire" in transcript_lower and "transfer" in transcript_lower):
            return {
                "intent": "FINANCIAL_TRANSFER",
                "indicators": ["urgently execute", "immediate wire transfer", "$250,000", "bypass standard secondary clearance"],
                "intent_category": "FINANCIAL_TRANSFER",
                "urgency_level": "CRITICAL",
                "suspicious_keywords": ["urgently execute", "immediate wire transfer", "$250,000", "bypass standard secondary clearance"],
                "coercion_probability": 0.91,
                "conversation_risk_score": 0.95
            }
        elif preset == "OTP_HARVESTING" or ("otp" in transcript_lower or "authenticator" in transcript_lower or "verification code" in transcript_lower):
            return {
                "intent": "OTP_HARVESTING",
                "indicators": ["authenticator device", "6-digit SMS verification code", "corporate banking"],
                "intent_category": "OTP_HARVESTING",
                "urgency_level": "HIGH",
                "suspicious_keywords": ["authenticator device", "6-digit SMS verification code", "corporate banking"],
                "coercion_probability": 0.84,
                "conversation_risk_score": 0.88
            }
        elif preset == "LEGITIMATE_CALL":
            return {
                "intent": "ROUTINE",
                "indicators": [],
                "intent_category": "ROUTINE",
                "urgency_level": "LOW",
                "suspicious_keywords": [],
                "coercion_probability": 0.05,
                "conversation_risk_score": 0.08
            }
        elif preset == "ROUTINE_VENDOR":
            return {
                "intent": "URGENT_VERIFICATION",
                "indicators": ["updated our ABA routing number", "invoice payment"],
                "intent_category": "URGENT_VERIFICATION",
                "urgency_level": "MEDIUM",
                "suspicious_keywords": ["updated our ABA routing number", "invoice payment"],
                "coercion_probability": 0.42,
                "conversation_risk_score": 0.48
            }

        # Comprehensive rule-based NLP intent detection
        keywords: List[str] = []
        risk = 0.05
        intent = "INFORMATIONAL"
        urgency = "LOW"

        # 1. Financial fraud & wire requests
        if any(w in transcript_lower for w in ["wire", "transfer", "bank", "fund", "dollar", "payment", "$", "invoice", "routing"]):
            keywords.append("financial payment / fund transfer discussion")
            intent = "FINANCIAL_TRANSFER"
            risk += 0.45
            urgency = "HIGH"

        # 2. OTP / Credential harvesting
        if any(w in transcript_lower for w in ["otp", "code", "sms", "password", "pin", "token", "authenticator", "2fa"]):
            keywords.append("credential / authentication factor request")
            intent = "OTP_HARVESTING"
            risk += 0.50
            urgency = "HIGH"

        # 3. Account Takeover / Unauthorized modification
        if any(w in transcript_lower for w in ["reset password", "change account", "new routing number", "bypass clearance", "disable mfa"]):
            keywords.append("account alteration / security bypass attempt")
            intent = "ACCOUNT_TAKEOVER"
            risk += 0.55
            urgency = "HIGH"

        # 4. Authority & Impersonation Pressure
        if any(w in transcript_lower for w in ["ceo", "executive", "board meeting", "do not contact", "overseas", "vip", "confidential request"]):
            keywords.append("executive authority impersonation tactic")
            risk += 0.25

        # 5. Urgent coercion signals
        if any(w in transcript_lower for w in ["urgent", "urgently", "immediately", "right now", "emergency", "hurry", "asap", "within the hour"]):
            keywords.append("coercive psychological urgency pressure")
            risk += 0.30
            urgency = "CRITICAL" if urgency == "HIGH" else "HIGH"

        risk = min(1.0, risk)

        return {
            "intent": intent,
            "indicators": keywords,
            "intent_category": intent,
            "urgency_level": urgency,
            "suspicious_keywords": keywords,
            "coercion_probability": round(risk * 0.9, 2),
            "conversation_risk_score": round(risk, 2)
        }
