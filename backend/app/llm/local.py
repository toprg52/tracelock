import os
import json
import urllib.request
from typing import Any
from backend.app.llm.provider import BaseLLMProvider

class LocalLLMProvider(BaseLLMProvider):
    def __init__(self):
        self.endpoint = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434/api/generate")

    def generate_json(self, prompt: str, schema_dict: dict) -> dict:
        try:
            data = {
                "model": "codellama",
                "prompt": prompt + f"\nOutput raw JSON matches: {json.dumps(schema_dict)}",
                "format": "json",
                "stream": False
            }
            req = urllib.request.Request(
                self.endpoint, 
                data=json.dumps(data).encode("utf-8"), 
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                return json.loads(res_body["response"])
        except Exception:
            return self._simulate_schema_response(schema_dict)

    def _simulate_schema_response(self, schema_dict: dict) -> dict:
        res: dict[str, Any] = {}
        properties = schema_dict.get("properties", {})
        for prop, val in properties.items():
            t = val.get("type")
            if t == "string":
                res[prop] = "local_ollama_fallback"
            elif t == "integer" or t == "number":
                res[prop] = 1
            elif t == "boolean":
                res[prop] = True
            elif t == "array":
                res[prop] = []
            elif t == "object":
                res[prop] = {}
        return res
