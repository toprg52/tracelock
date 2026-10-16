from typing import Dict, Any
from backend.app.investigation.schemas import InvestigationPackage
from backend.app.investigation.timeline import TimelineBuilder
from backend.app.investigation.graph import GraphBuilder
from backend.app.investigation.campaign import CampaignCorrelator
from backend.app.investigation.summary import SummaryGenerator
from backend.app.investigation.narrative import NarrativeGenerator

class InvestigationBuilder:
    @staticmethod
    def build(case_id: str, artifacts: Dict[str, Any]) -> InvestigationPackage:
        summary = SummaryGenerator.generate(artifacts)
        timeline = TimelineBuilder.build_timeline(artifacts)
        evidence_graph = GraphBuilder.build_graph(artifacts)
        campaign = CampaignCorrelator.correlate(artifacts)
        threat_narrative = NarrativeGenerator.generate(artifacts)
        
        return InvestigationPackage(
            case_id=case_id,
            summary=summary,
            timeline=timeline,
            evidence_graph=evidence_graph,
            campaign=campaign,
            threat_narrative=threat_narrative
        )
