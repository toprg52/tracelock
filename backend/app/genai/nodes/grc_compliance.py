import json
from ..state import GraphState
from ..clients import LLMRouter

router = LLMRouter()

GRC_PROMPT = """You are a GRC (Governance, Risk, and Compliance) Agent.
Analyze the following context regarding an Android application and determine compliance violations
(e.g., GDPR, PSD2, RBI guidelines) based on the app's behavior.
Return JSON: {{"violations": ["..."], "compliance_summary": "..."}}

Context:
Permissions: {permissions}
Behaviors: {behaviors}
"""

def run(state: GraphState) -> GraphState:
    if "errors" not in state:
        state["errors"] = []
        
    try:
        behaviors = ""
        if state.get("deobfuscation"):
            behaviors = state["deobfuscation"].behavioral_summary
            
        prompt = GRC_PROMPT.format(
            permissions=json.dumps(state["forensic_context"].permissions),
            behaviors=behaviors
        )
        text, model_used = router.complete(prompt, prefer="groq")
        parsed = json.loads(text)
        state["grc"] = parsed
    except Exception as e:
        state["errors"].append(f"grc_compliance failed: {e}")
        state["grc"] = {"violations": [], "compliance_summary": "Failed to analyze compliance"}
    return state
