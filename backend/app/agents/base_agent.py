import os
from typing import Any
from backend.app.llm.gemini import GeminiProvider
from backend.app.llm.openrouter import OpenRouterProvider
from backend.app.llm.local import LocalLLMProvider

class BaseAgent:
    name: str = "BaseAgent"
    version: str = "1.0"
    description: str = "Abstract Base Agent class"
    prompt_file: str = ""

    def __init__(self):
        # Load providers in retry priority order
        self.providers = [
            GeminiProvider(),
            OpenRouterProvider(),
            LocalLLMProvider()
        ]

    def load_prompt(self) -> str:
        prompt_path = os.path.join("backend", "prompts", self.prompt_file)
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
        return f"System prompt for {self.name} agent."

    def execute_with_fallback(self, context_str: str, schema_dict: dict) -> dict:
        system_prompt = self.load_prompt()
        prompt = f"{system_prompt}\n\n[Analysis Case Context]\n{context_str}"
        
        # Iteratively try providers in order
        for provider in self.providers:
            try:
                result = provider.generate_json(prompt, schema_dict)
                if result:
                    # Validate keys presence
                    return result
            except Exception as e:
                print(f"[!] {self.name} failed execution on {provider.__class__.__name__}: {str(e)}")
                
        return {"error": "All LLM providers failed execution"}
