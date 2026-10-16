from pydantic import BaseModel, Field
from typing import List, Dict, Any

class TimelineEvent(BaseModel):
    timestamp: str
    source: str  # static, dynamic, AI, risk
    artifact: str
    confidence: float
    description: str

class GraphNode(BaseModel):
    id: str
    type: str  # apk, activity, permission, certificate, domain, ip, file, runtime_event, mitre_technique, ioc
    label: str

class GraphEdge(BaseModel):
    source: str
    target: str
    type: str  # REQUESTS, CONNECTS_TO, CREATES, READS, WRITES, SENDS, RECEIVES, USES

class EvidenceGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class CampaignCorrelations(BaseModel):
    confidence: float
    related_samples: List[str]
    shared_infrastructure: List[str]
    family_hypothesis: str

class InvestigationPackage(BaseModel):
    case_id: str
    summary: Dict[str, Any]
    timeline: List[TimelineEvent]
    evidence_graph: EvidenceGraph
    campaign: CampaignCorrelations
    threat_narrative: str
