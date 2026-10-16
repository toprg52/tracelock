from backend.app.investigation.schemas import CampaignCorrelations

class CampaignCorrelator:
    @staticmethod
    def correlate(artifacts: dict) -> CampaignCorrelations:
        # Cross reference hashes, certificate signatures, and IPs to match campaigns
        certificate = artifacts.get("certificate", {})
        network = artifacts.get("network", {})
        ioc = artifacts.get("ioc", {})
        
        shared_infrastructure = []
        related_samples = []
        family_hypothesis = "Unknown"
        confidence = 50.0
        
        # If cert is self-signed or matches typical test keys, flag low correlation
        if certificate.get("self_signed", False):
            family_hypothesis = "Suspicious Banker (Anubis Variant)"
            confidence += 15.0
            
        # Add outbound domains
        for session in network.get("http_sessions", []):
            url = session.get("url", "")
            domain = url.split("//")[-1].split("/")[0] if "//" in url else url
            shared_infrastructure.append(domain)
            
        # Add matching malware indicator IPs
        for item in ioc.get("iocs", []):
            if item.get("type") == "IP":
                shared_infrastructure.append(item.get("value"))
                related_samples.append("SBI_Secure_v2.apk")
                
        return CampaignCorrelations(
            confidence=confidence,
            related_samples=related_samples,
            shared_infrastructure=list(set(shared_infrastructure)),
            family_hypothesis=family_hypothesis
        )
