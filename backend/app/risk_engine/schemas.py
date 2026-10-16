from pydantic import BaseModel, Field
from typing import List, Dict, Any

class EvidenceItem(BaseModel):
    dimension: str
    score: float
    weight: float
    confidence: float
    explanation: str

class RiskBreakdown(BaseModel):
    threat_index: float = Field(description="Final calculated threat score 0-100")
    risk_category: str = Field(description="Safety status label (Safe, Low, Medium, High, Critical)")
    confidence: float = Field(description="Aggregated confidence evaluation score")
    evidence_attribution: List[EvidenceItem] = Field(description="Traceable explanations per dimension")
    recommendations: List[str] = Field(description="Action guidelines generated")
    formula_version: str = Field(default="1.0")
