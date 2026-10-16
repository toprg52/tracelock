class PermissionDimension:
    @staticmethod
    def evaluate(permissions_data: dict) -> float:
        return float(permissions_data.get("risk_score", 0))

class RuntimeDimension:
    @staticmethod
    def evaluate(runtime_data: dict) -> float:
        events = runtime_data.get("events", [])
        return min(len(events) * 20.0, 100.0)

class NetworkDimension:
    @staticmethod
    def evaluate(network_data: dict) -> float:
        sessions = network_data.get("http_sessions", [])
        return min(len(sessions) * 30.0, 100.0)

class CertificateDimension:
    @staticmethod
    def evaluate(certificate_data: dict) -> float:
        # Self-signed certificates add 50 risk points, missing signatures add 100 risk points
        if not certificate_data.get("is_signed", True):
            return 100.0
        if certificate_data.get("self_signed", False):
            return 50.0
        return 0.0

class IocDimension:
    @staticmethod
    def evaluate(ioc_data: dict) -> float:
        iocs = ioc_data.get("iocs", [])
        return min(len(iocs) * 25.0, 100.0)

class ObfuscationDimension:
    @staticmethod
    def evaluate(obfuscation_data: dict) -> float:
        return float(obfuscation_data.get("obfuscation_score", 0))

class MitreDimension:
    @staticmethod
    def evaluate(mitre_data: dict) -> float:
        techniques = mitre_data.get("techniques", [])
        return min(len(techniques) * 20.0, 100.0)

class CampaignDimension:
    @staticmethod
    def evaluate(campaign_data: dict) -> float:
        return 50.0 if campaign_data.get("associated_campaigns") else 0.0

class AiContextDimension:
    @staticmethod
    def evaluate(risk_context_data: dict) -> float:
        cats = risk_context_data.get("behavioral_classifications", [])
        return min(len(cats) * 25.0, 100.0)
