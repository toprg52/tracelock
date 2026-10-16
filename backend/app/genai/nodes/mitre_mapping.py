import json
from ..state import GraphState, MitreOutput
from ..clients import LLMRouter

router = LLMRouter()

MITRE_PROMPT = """You are a MITRE ATT&CK Mobile mapping agent.
Given this behavioral summary and permission list, map ONLY to techniques
explicitly supported by the evidence below. Do not infer techniques not
supported by the evidence. Return JSON: {{"techniques": [{{"id":"T1412", "name":"...", "evidence":"..."}}]}}

Behavioral summary: {summary}
Permissions: {permissions}
"""

def run(state: GraphState) -> GraphState:
    if "errors" not in state:
        state["errors"] = []
        
    try:
        summary = ""
        if state.get("deobfuscation"):
            summary = state["deobfuscation"].behavioral_summary
            
        prompt = MITRE_PROMPT.format(
            summary=summary,
            permissions=state["forensic_context"].permissions,
        )
        text, model_used = router.complete(prompt, prefer="groq")
        parsed = json.loads(text)
        state["mitre"] = MitreOutput(techniques=parsed.get("techniques", []), confidence=0.8)
    except Exception as e:
        state["errors"].append(f"mitre_mapping failed: {e}")
        state["mitre"] = MitreOutput(techniques=[], confidence=0.0)
    return state
