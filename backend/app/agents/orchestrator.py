from typing import Dict, Any
import json

from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.schemas import (
    DeobfuscationSchema,
    NetworkIntelligenceSchema,
    MitreSchema,
    ComplianceSchema,
    CampaignSchema,
    RiskContextSchema
)

class DeobfuscationAgent(BaseAgent):
    name = "DeobfuscationAgent"
    prompt_file = "deobfuscation.md"

    def execute(self, context_str: str) -> dict:
        schema = DeobfuscationSchema.model_json_schema()
        return self.execute_with_fallback(context_str, schema)

class NetworkIntelligenceAgent(BaseAgent):
    name = "NetworkIntelligenceAgent"
    prompt_file = "network.md"

    def execute(self, context_str: str) -> dict:
        schema = NetworkIntelligenceSchema.model_json_schema()
        return self.execute_with_fallback(context_str, schema)

class MitreMappingAgent(BaseAgent):
    name = "MitreMappingAgent"
    prompt_file = "mitre.md"

    def execute(self, context_str: str) -> dict:
        schema = MitreSchema.model_json_schema()
        return self.execute_with_fallback(context_str, schema)

class ComplianceAgent(BaseAgent):
    name = "ComplianceAgent"
    prompt_file = "compliance.md"

    def execute(self, context_str: str) -> dict:
        schema = ComplianceSchema.model_json_schema()
        return self.execute_with_fallback(context_str, schema)

class CampaignAgent(BaseAgent):
    name = "CampaignAgent"
    prompt_file = "campaign.md"

    def execute(self, context_str: str) -> dict:
        schema = CampaignSchema.model_json_schema()
        return self.execute_with_fallback(context_str, schema)

class RiskContextAgent(BaseAgent):
    name = "RiskContextAgent"
    prompt_file = "risk_context.md"

    def execute(self, context_str: str) -> dict:
        schema = RiskContextSchema.model_json_schema()
        return self.execute_with_fallback(context_str, schema)

class LangGraphOrchestrator:
    def __init__(self):
        from backend.app.genai.graph import compiled_graph
        self.graph = compiled_graph

    def run_pipeline(self, context_str: str) -> Dict[str, Any]:
        print("[*] Running real multi-agent AI orchestration pipeline with LangGraph...")
        
        # Parse context_str (assuming it's a JSON string or dict built by ContextBuilder)
        # ContextBuilder returns a stringified JSON in the original code, but we need dict here.
        if isinstance(context_str, str):
            try:
                context = json.loads(context_str)
            except:
                context = {}
        else:
            context = context_str

        # Build initial state
        initial_state = {
            "forensic_context": {
                "case_id": "demo_case",
                "permissions": context.get("permissions", {}).get("matched_rules", []),
                "decompiled_snippets": [],
                "pcap_summary": context.get("network", {}),
                "certificate_info": context.get("certificate", {}),
                "obfuscation_score": context.get("obfuscation", {}).get("obfuscation_score", 0.0)
            }
        }
        
        # Run graph
        final_state = self.graph.invoke(initial_state)
        
        # Serialize Pydantic objects if necessary
        deobfuscation = final_state.get("deobfuscation")
        if hasattr(deobfuscation, "model_dump"):
            deobfuscation = deobfuscation.model_dump()
            
        mitre = final_state.get("mitre")
        if hasattr(mitre, "model_dump"):
            mitre = mitre.model_dump()
            
        # Map GraphState to expected legacy format
        return {
            "deobfuscation": deobfuscation or {},
            "network_intelligence": final_state.get("network_intel") or {},
            "mitre": mitre or {},
            "compliance": final_state.get("grc") or {},
            "campaign": {"note": "Handled by graph DB module now"},
            "risk_context": final_state.get("risk_score") or {}
        }

