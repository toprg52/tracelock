from pydantic import BaseModel, Field
from typing import List, Dict, Any

class ReportContext(BaseModel):
    case_id: str
    report_type: str  # analyst, executive, compliance, customer_advisory
    title: str
    generated_at: str
    confidentiality_label: str
    branding: Dict[str, Any]
    investigation_data: Dict[str, Any]
    integrity_hash: str = ""
