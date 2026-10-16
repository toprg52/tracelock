import os
import json
from typing import Any
from backend.app.llm.provider import BaseLLMProvider

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        # Fallback/Mock initialization if API key is not configured
        if not self.api_key:
            print("[!] GEMINI_API_KEY environment variable is missing. Initializing fallback mock mode.")
            
    def generate_json(self, prompt: str, schema_dict: dict) -> dict:
        if not self.api_key:
            # Fallback simulator generating correct JSON keys conforming to schema
            return self._simulate_schema_response(schema_dict)
            
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Request JSON structured output
            response = model.generate_content(
                prompt + f"\nOutput must strictly conform to this JSON schema: {json.dumps(schema_dict)}",
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"[!] Gemini generation error: {str(e)}. Triggering simulation fallback.")
            return self._simulate_schema_response(schema_dict)

    def _simulate_schema_response(self, schema_dict: dict) -> dict:
        # Simple schema structure simulator
        res: dict[str, Any] = {}
        properties = schema_dict.get("properties", {})
        for prop, val in properties.items():
            t = val.get("type")
            if t == "string":
                res[prop] = "simulated_value"
            elif t == "integer" or t == "number":
                res[prop] = 1
            elif t == "boolean":
                res[prop] = True
            elif t == "array":
                res[prop] = []
            elif t == "object":
                res[prop] = {}
        return res


class GeminiPipeline:
    def __init__(self):
        self.provider = GeminiProvider()

    def execute_signal_fusion(self, static_metadata: dict, dynamic_telemetry: dict) -> dict:
        confirmed_signals = []
        
        # Cross-reference declared intent against actual runtime execution
        permissions = static_metadata.get("permissions", [])
        if "android.permission.BIND_ACCESSIBILITY_SERVICE" in permissions:
            if dynamic_telemetry.get("accessibility_abuse_detected", False):
                confirmed_signals.append("CONFIRMED_ACCESSIBILITY_OVERLAY_TROJAN")
                
        return {"fusion_matrix": confirmed_signals}

    def run_dossier_analysis(self, case_id: str, forensic_context: dict) -> dict:
        print(f"[*] GeminiPipeline: Running LangGraph-style workflow for case {case_id}")
        
        static_extraction = forensic_context.get("static", forensic_context)
        dynamic_extraction = forensic_context.get("dynamic", {})
        
        fusion_signals = self.execute_signal_fusion(static_extraction, dynamic_extraction)
        
        # Unified Batch Generation to dramatically save input tokens
        unified_schema = {
            "type": "object",
            "properties": {
                "narrative": {
                    "type": "object",
                    "properties": {
                        lang: {
                            "type": "object",
                            "properties": {
                                "summary": {"type": "string"},
                                "threat_family": {"type": "string"},
                                "technical_details": {"type": "string"},
                                "c2_servers": {"type": "array", "items": {"type": "string"}}
                            },
                            "required": ["summary", "threat_family", "technical_details", "c2_servers"]
                        } for lang in ["en", "hi", "kn", "te", "ta"]
                    },
                    "required": ["en", "hi", "kn", "te", "ta"]
                },
                "mitre": {
                    "type": "object",
                    "properties": {
                        "tactics": {"type": "array", "items": {"type": "string"}},
                        "techniques": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "name": {"type": "string"},
                                    "description": {"type": "string"}
                                },
                                "required": ["id", "name"]
                            }
                        }
                    },
                    "required": ["tactics", "techniques"]
                },
                "regional_advisory": {
                    "type": "object",
                    "properties": {
                        lang: {
                            "type": "object",
                            "properties": {
                                "summary": {"type": "string"},
                                "advisory": {"type": "string"}
                            },
                            "required": ["summary", "advisory"]
                        } for lang in ["en", "hi", "kn", "te", "ta"]
                    },
                    "required": ["en", "hi", "kn", "te", "ta"]
                }
            },
            "required": ["narrative", "mitre", "regional_advisory"]
        }
        
        unified_prompt = f"""
        Analyze these APK static extractions and dynamic runtime telemetry: {json.dumps(forensic_context)}.
        You are an expert review board. Perform the following tasks in a single pass to output a strict JSON payload:
        1. Create a detailed Forensic Case Narrative (summary, threat_family, technical_details, c2_servers) incorporating fusion signals {json.dumps(fusion_signals)}. Provide this narrative completely translated in 5 languages: English (en), Hindi (hi), Kannada (kn), Telugu (te), and Tamil (ta).
        2. Map extracted properties to MITRE ATT&CK tactics & techniques.
        3. Generate safety advisories in English (en), Hindi (hi), Kannada (kn), Telugu (te), and Tamil (ta) warning users about this banking trojan based on the forensic context.
        """
        
        unified_data = self.provider.generate_json(unified_prompt, unified_schema)
        
        narrative_data = unified_data.get("narrative", {})
        mitre_data = unified_data.get("mitre", {})
        translation_data = unified_data.get("regional_advisory", {})

        # Combine results
        combined_analysis = {
            "case_id": case_id,
            "narrative": narrative_data,
            "mitre": mitre_data,
            "regional_advisory": translation_data,
            "fusion_matrix": fusion_signals,
            "forensic_context": forensic_context
        }

        # Save artifacts to MinIO
        try:
            from backend.app.services.artifact_service import ArtifactService
            art_service = ArtifactService()
            art_service.save_artifact(case_id, "threat_narrative.json", narrative_data)
            art_service.save_artifact(case_id, "mitre.json", mitre_data)
            art_service.save_artifact(case_id, "regional_advisory.json", translation_data)
        except Exception as e:
            print(f"[!] Failed to save AI artifacts to MinIO: {str(e)}")

        return combined_analysis

