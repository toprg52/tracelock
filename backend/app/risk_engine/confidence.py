class ConfidenceEngine:
    @staticmethod
    def calculate(artifacts: dict) -> float:
        confidence = 70.0  # Base confidence level
        
        # Increase confidence when static and dynamic agree
        has_static = "permissions" in artifacts
        has_dynamic = "runtime" in artifacts
        has_ai = "mitre" in artifacts
        
        if has_static and has_dynamic:
            confidence += 15.0
        if has_ai:
            confidence += 10.0
            
        # Decrease confidence if dynamic is completely missing
        if not has_dynamic:
            confidence -= 20.0
            
        return max(0.0, min(confidence, 100.0))
