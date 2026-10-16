import json
from ..state import GraphState, DeobfuscationOutput
from ..clients import LLMRouter

router = LLMRouter()

DEOBFUSCATION_PROMPT = """You are an Android Deobfuscation Agent.
Analyze the following decompiled snippets and obfuscation score.
Extract meaningful function names and a behavioral summary.
Return JSON: {{"renamed_functions": {{"old_name": "new_name"}}, "behavioral_summary": "...", "confidence": 0.0-1.0}}

Snippets: {snippets}
Obfuscation Score: {score}
"""

def run(state: GraphState) -> GraphState:
    if "errors" not in state:
        state["errors"] = []
        
    try:
        prompt = DEOBFUSCATION_PROMPT.format(
            snippets="\\n".join(state["forensic_context"].decompiled_snippets),
            score=state["forensic_context"].obfuscation_score,
        )
        text, model_used = router.complete(prompt, prefer="groq")
        parsed = json.loads(text)
        state["deobfuscation"] = DeobfuscationOutput(
            renamed_functions=parsed.get("renamed_functions", {}),
            behavioral_summary=parsed.get("behavioral_summary", ""),
            confidence=parsed.get("confidence", 0.8)
        )
    except Exception as e:
        state["errors"].append(f"deobfuscation failed: {e}")
        state["deobfuscation"] = DeobfuscationOutput(renamed_functions={}, behavioral_summary="Failed to deobfuscate", confidence=0.0)
    return state
