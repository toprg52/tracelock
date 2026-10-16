from typing import Dict, Any, List
from backend.app.risk_engine.weights import RiskWeightsManager
from backend.app.risk_engine.confidence import ConfidenceEngine
from backend.app.risk_engine.recommendations import RecommendationEngine
from backend.app.risk_engine.dimensions import (
    PermissionDimension,
    RuntimeDimension,
    NetworkDimension,
    CertificateDimension,
    IocDimension,
    ObfuscationDimension,
    MitreDimension,
    CampaignDimension,
    AiContextDimension
)
from backend.app.risk_engine.schemas import RiskBreakdown, EvidenceItem

class RiskEngine:
    @staticmethod
    def calculate_risk(artifacts: Dict[str, Any]) -> RiskBreakdown:
        weights = RiskWeightsManager.load_weights()
        
        # Evaluate dimension scores
        scores = {
            "permission": PermissionDimension.evaluate(artifacts.get("permissions", {})),
            "runtime": RuntimeDimension.evaluate(artifacts.get("runtime", {})),
            "network": NetworkDimension.evaluate(artifacts.get("network", {})),
            "certificate": CertificateDimension.evaluate(artifacts.get("certificate", {})),
            "ioc": IocDimension.evaluate(artifacts.get("ioc", {})),
            "obfuscation": ObfuscationDimension.evaluate(artifacts.get("obfuscation", {})),
            "mitre": MitreDimension.evaluate(artifacts.get("mitre", {})),
            "campaign": CampaignDimension.evaluate(artifacts.get("campaign", {})),
            "ai_context": AiContextDimension.evaluate(artifacts.get("risk_context", {}))
        }
        
        # Calculate mathematically
        total_weight = sum(weights.values())
        weighted_score_sum = sum(scores[dim] * weights[dim] for dim in scores)
        
        threat_index = weighted_score_sum / total_weight if total_weight > 0 else 0.0
        
        # Evaluate confidence
        confidence = ConfidenceEngine.calculate(artifacts)
        
        # Determine risk category
        if threat_index >= 81:
            category = "Critical"
        elif threat_index >= 61:
            category = "High"
        elif threat_index >= 41:
            category = "Medium"
        elif threat_index >= 21:
            category = "Low"
        else:
            category = "Safe"
            
        # Compile evidence attributions
        evidence_attribution = []
        for dim in scores:
            evidence_attribution.append(
                EvidenceItem(
                    dimension=dim.upper(),
                    score=scores[dim],
                    weight=weights[dim],
                    confidence=confidence,
                    explanation=f"Dimension {dim.upper()} evaluated to score {scores[dim]:.2f}/100.0 with weight configuration factor of {weights[dim]}."
                )
            )
            
        recommendations = RecommendationEngine.get_recommendations(threat_index)
        
        return RiskBreakdown(
            threat_index=round(threat_index, 2),
            risk_category=category,
            confidence=confidence,
            evidence_attribution=evidence_attribution,
            recommendations=recommendations,
            formula_version="1.0"
        )
