from pydantic import BaseModel, Field
from typing import List, Dict, Any

class DeobfuscationSchema(BaseModel):
    behavioral_summary: str = Field(description="Summary of decompiled source code patterns")
    suspicious_methods: List[str] = Field(description="Methods targeting sensitive APIs or reflection calls")
    suspicious_classes: List[str] = Field(description="Obfuscated class identifier strings")
    confidence: float = Field(description="Analysis certainty 0-100")

class NetworkIntelligenceSchema(BaseModel):
    c2_indicators: List[str] = Field(description="Command & Control servers identified")
    exfiltration_evidence: str = Field(description="Evidence of data transmission patterns")
    dns_anomalies: List[str] = Field(description="Suspicious domains contacted")
    suspicious_endpoints: List[str] = Field(description="Full paths target URL hosts")

class MitreSchema(BaseModel):
    techniques: List[str] = Field(description="MITRE ATT&CK Mobile matrix technique IDs (e.g. T1406)")
    confidence: float = Field(description="Certainty score of matched techniques")
    evidence: List[str] = Field(description="Observed behavior snippet mappings")

class ComplianceSchema(BaseModel):
    impacted_regulations: List[str] = Field(description="Clauses violated under RBI, DPDP, IT Acts")
    required_notifications: List[str] = Field(description="Mandatory reporting disclosures required")
    compliance_summary: str = Field(description="Summary of regulatory breaches")

class CampaignSchema(BaseModel):
    malware_family_match: str = Field(description="Classified malware family matching patterns")
    associated_campaigns: List[str] = Field(description="Known dynamic campaigns linked")
    shared_infrastructure: List[str] = Field(description="IPs, certs, or domains re-used across cases")

class RiskContextSchema(BaseModel):
    behavioral_classifications: List[str] = Field(description="Classified alerts (e.g., OTP_INTERCEPTION, ACCESSIBILITY_ABUSE)")
    supporting_evidence: List[str] = Field(description="Forensic proof logs")
