import json
from ..state import GraphState
from ..clients import LLMRouter

router = LLMRouter()

NETWORK_PROMPT = """You are a Network Intelligence Agent.
Analyze this PCAP summary and certificate info.
Identify any known malicious patterns, anomalous behavior, or suspicious C2 communication.
Return JSON: {{"suspicious_indicators": [], "analysis_summary": "..."}}

PCAP Summary: {pcap}
Certificate Info: {cert}
"""

def run(state: GraphState) -> GraphState:
    if "errors" not in state:
        state["errors"] = []
        
    try:
        prompt = NETWORK_PROMPT.format(
            pcap=json.dumps(state["forensic_context"].pcap_summary),
            cert=json.dumps(state["forensic_context"].certificate_info),
        )
        text, model_used = router.complete(prompt, prefer="gemini") # Gemini is good for long context network data
        parsed = json.loads(text)
        state["network_intel"] = parsed
    except Exception as e:
        state["errors"].append(f"network_intel failed: {e}")
        state["network_intel"] = {"suspicious_indicators": [], "analysis_summary": "Failed to analyze network data"}
    return state
