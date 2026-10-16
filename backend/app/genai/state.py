from typing import TypedDict, Optional
from pydantic import BaseModel

class ForensicContext(BaseModel):
    case_id: str
    permissions: list[str]
    decompiled_snippets: list[str]
    pcap_summary: dict
    certificate_info: dict
    obfuscation_score: float

class DeobfuscationOutput(BaseModel):
    renamed_functions: dict[str, str]
    behavioral_summary: str
    confidence: float

class MitreOutput(BaseModel):
    techniques: list[dict]  # [{"id": "T1412", "name": "...", "evidence": "..."}]
    confidence: float

class GraphState(TypedDict):
    forensic_context: ForensicContext
    deobfuscation: Optional[DeobfuscationOutput]
    mitre: Optional[MitreOutput]
    network_intel: Optional[dict]
    grc: Optional[dict]
    risk_score: Optional[dict]
    final_report: Optional[str]
    errors: list[str]  # nodes append here on failure — don't halt the pipeline
