import os
import json
import urllib.request
from typing import Any
from backend.app.llm.provider import BaseLLMProvider

class OpenRouterProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")

    def generate_json(self, prompt: str, schema_dict: dict) -> dict:
        if not self.api_key:
            return self._simulate_schema_response(schema_dict)
            
        try:
            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "meta-llama/llama-3-8b-instruct:free",
                "messages": [
                    {"role": "user", "content": prompt + f"\nOutput JSON matching schema: {json.dumps(schema_dict)}"}
                ],
                "response_format": {"type": "json_object"}
            }
            req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
            with urllib.request.urlopen(req) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                content = res_body["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception as e:
            print(f"[!] OpenRouter request failed: {str(e)}")
            return self._simulate_schema_response(schema_dict)

    def _simulate_schema_response(self, schema_dict: dict) -> dict:
        # Fallback simulator
        res: dict[str, Any] = {}
        properties = schema_dict.get("properties", {})
        for prop, val in properties.items():
            t = val.get("type")
            if t == "string":
                res[prop] = "openrouter_fallback"
            elif t == "integer" or t == "number":
                res[prop] = 1
            elif t == "boolean":
                res[prop] = True
            elif t == "array":
                res[prop] = []
            elif t == "object":
                res[prop] = {}
        return res
