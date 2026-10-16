import json
from ..state import GraphState
from ..clients import LLMRouter

router = LLMRouter()

REPORT_PROMPT = """You are a Final Report Generation Agent.
Synthesize the previous pipeline stages into a comprehensive Markdown report.
Include sections for Executive Summary, MITRE ATT&CK Mapping, Network Intelligence, and Compliance violations.

Risk Score: {risk_score}
MITRE: {mitre}
Network: {network}
GRC: {grc}

Return JSON with a single key 'markdown_report' containing the formatted markdown text.
"""

def run(state: GraphState) -> GraphState:
    if "errors" not in state:
        state["errors"] = []
        
    try:
        mitre_data = [t.get("name") for t in getattr(state.get("mitre"), "techniques", [])] if state.get("mitre") else []
        
        prompt = REPORT_PROMPT.format(
            risk_score=json.dumps(state.get("risk_score", {})),
            mitre=json.dumps(mitre_data),
            network=json.dumps(state.get("network_intel", {})),
            grc=json.dumps(state.get("grc", {}))
        )
        text, model_used = router.complete(prompt, prefer="gemini") # Gemini 1.5 is great for long reports
        parsed = json.loads(text)
        state["final_report"] = parsed.get("markdown_report", "")
    except Exception as e:
        state["errors"].append(f"report_generation failed: {e}")
        state["final_report"] = "# Report Generation Failed\n\nPlease check the pipeline errors."
    return state
