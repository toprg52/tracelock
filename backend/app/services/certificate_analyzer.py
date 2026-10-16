from androguard.core.apk import APK
from typing import Dict, Any
import hashlib

class CertificateAnalyzer:
    @staticmethod
    def analyze(file_path: str) -> Dict[str, Any]:
        try:
            apk = APK(file_path)
            certs = apk.get_certificates()
            
            if not certs:
                return {"is_signed": False, "error": "No signing certificates found"}
                
            # Parse the primary certificate
            cert = certs[0]
            
            # Derive fingerprint hashes
            der_bytes = cert.asn1.dump()
            sha1 = hashlib.sha1(der_bytes).hexdigest().upper()
            sha256 = hashlib.sha256(der_bytes).hexdigest().upper()
            
            # Extract issuer and subject fields
            issuer = str(cert.issuer.human_friendly)
            subject = str(cert.subject.human_friendly)
            
            # Verify self-signed status
            self_signed = issuer == subject
            
            return {
                "is_signed": True,
                "sha1": sha1,
                "sha256": sha256,
                "issuer": issuer,
                "subject": subject,
                "serial_number": str(cert.serial_number),
                "valid_from": str(cert.not_valid_before),
                "valid_to": str(cert.not_valid_after),
                "self_signed": self_signed
            }
        except Exception as e:
            return {
                "is_signed": False,
                "error": f"Failed to analyze certificates: {str(e)}"
            }
