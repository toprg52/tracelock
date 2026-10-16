from abc import ABC, abstractmethod
from typing import Any

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_json(self, prompt: str, schema_dict: dict) -> dict:
        """
        Generate structured JSON output from LLM based on system prompt and schema definition.
        """
        pass
