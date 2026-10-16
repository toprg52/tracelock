import os

class RiskWeightsManager:
    @staticmethod
    def load_weights() -> dict:
        config_path = os.path.join("backend", "config", "risk_weights.yaml")
        weights: dict[str, float] = {
            "permission": 15,
            "runtime": 25,
            "network": 15,
            "certificate": 10,
            "ioc": 10,
            "obfuscation": 10,
            "mitre": 5,
            "campaign": 5,
            "ai_context": 5
        }
        
        if not os.path.exists(config_path):
            return weights
            
        try:
            with open(config_path, "r") as f:
                for line in f:
                    if ":" in line and not line.strip().startswith("#"):
                        parts = line.split(":")
                        key = parts[0].strip()
                        val_str = parts[1].strip()
                        # If nested yaml, capture weight value
                        if val_str == "" and len(parts) > 1:
                            continue
                        try:
                            weights[key] = float(val_str)
                        except ValueError:
                            pass
        except Exception as e:
            print(f"[!] Error parsing risk_weights.yaml: {str(e)}")
            
        return weights
