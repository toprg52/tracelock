import json
from ..state import GraphState
from ..clients import LLMRouter

router = LLMRouter()

RISK_PROMPT = """You are a Risk Scoring Agent.
Based on the extracted MITRE techniques, network intelligence, and GRC compliance violations,
compute a final risk score from 0 to 100 (100 being most severe).
Return JSON: {{"score": 85, "reasoning": "...", "severity_label": "CRITICAL"}}

MITRE: {mitre}
Network: {network}
GRC: {grc}
"""

def run(state: GraphState) -> GraphState:
    if "errors" not in state:
        state["errors"] = []
        
    try:
        mitre_data = [t.get("name") for t in getattr(state.get("mitre"), "techniques", [])] if state.get("mitre") else []
        
        prompt = RISK_PROMPT.format(
            mitre=json.dumps(mitre_data),
            network=json.dumps(state.get("network_intel", {})),
            grc=json.dumps(state.get("grc", {}))
        )
        text, model_used = router.complete(prompt, prefer="groq")
        parsed = json.loads(text)
        state["risk_score"] = parsed
    except Exception as e:
        state["errors"].append(f"risk_scoring failed: {e}")
        state["risk_score"] = {"score": 50, "reasoning": "Failed to compute risk score", "severity_label": "UNKNOWN"}
    return state
