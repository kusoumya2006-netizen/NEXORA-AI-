import datetime
from typing import Dict, Any, Optional

class SecurityResponseAdapter:
    """
    Adapter interface for Security Response Workflow & Simulation Module.
    Triggers transaction holds, secondary MFA challenges, out-of-band callbacks,
    and alert logging based on risk level.
    """
    def __init__(self, mode: str = "mock"):
        self.mode = mode

    def execute_response(
        self,
        risk_level: str,
        call_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        context = context or {}
        risk_data = context.get("risk", {})
        risk_score = risk_data.get("risk_score", 0)
        reasons = risk_data.get("reasons", [])
        primary_reason = reasons[0] if reasons else f"Assessed threat risk level: {risk_level}"

        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        if risk_level == "CRITICAL":
            action_type = "BLOCK_AND_VERIFY"
            hold_transaction = True
            mfa_challenge_sent = True
            callback_requested = True
            sim_notice = "Suspicious transaction placed on HOLD. Secondary biometric callback queued."
            mitigation = "Target accounts locked, emergency SOC security alert emitted."
        elif risk_level == "HIGH":
            action_type = "TRIGGER_SECONDARY_VERIFICATION"
            hold_transaction = True
            mfa_challenge_sent = True
            callback_requested = True
            sim_notice = "Out-of-band MFA push notification sent to registered phone."
            mitigation = "Session flagged for elevated SOC review."
        elif risk_level == "MEDIUM":
            action_type = "WARNING"
            hold_transaction = False
            mfa_challenge_sent = True
            callback_requested = False
            sim_notice = "Warning banner displayed on analyst console. Increased monitoring active."
            mitigation = "Passive fraud heuristics elevated for subsequent interactions."
        else: # LOW
            action_type = "ALLOW"
            hold_transaction = False
            mfa_challenge_sent = False
            callback_requested = False
            sim_notice = "Interaction allowed. Routine passive monitoring recorded."
            mitigation = "None required."

        return {
            "action": action_type,
            "action_type": action_type,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "reason": primary_reason,
            "hold_transaction": hold_transaction,
            "mfa_challenge_sent": mfa_challenge_sent,
            "callback_requested": callback_requested,
            "execution_status": "EXECUTED",
            "details": {
                "simulation_notice": sim_notice,
                "mitigation": mitigation,
                "call_id": call_id,
                "timestamp": timestamp,
                "primary_reason": primary_reason
            }
        }
