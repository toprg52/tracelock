import json
from typing import Dict, Any

class ContextBuilder:
    @staticmethod
    def build_context(
        manifest: dict,
        permissions: dict,
        certificate: dict,
        ioc: dict,
        obfuscation: dict,
        runtime: dict,
        network: dict,
        filesystem: dict,
        anti_analysis: dict
    ) -> str:
        context_object = {
            "apk_metadata": {
                "package_name": manifest.get("package_name", "Unknown"),
                "min_sdk": manifest.get("min_sdk", "Unknown"),
                "target_sdk": manifest.get("target_sdk", "Unknown")
            },
            "manifest_details": {
                "activities": manifest.get("activities", []),
                "services": manifest.get("services", []),
                "receivers": manifest.get("receivers", []),
                "providers": manifest.get("providers", [])
            },
            "permissions": permissions.get("all_permissions_count", 0),
            "permissions_analysis": permissions.get("matched_rules", []),
            "certificate_signatures": {
                "sha256": certificate.get("sha256", "Unknown"),
                "issuer": certificate.get("issuer", "Unknown"),
                "self_signed": certificate.get("self_signed", False)
            },
            "iocs": ioc.get("iocs", []),
            "obfuscation_analysis": {
                "score": obfuscation.get("obfuscation_score", 0),
                "reasons": obfuscation.get("reasons", [])
            },
            "runtime_behavior": runtime.get("events", []),
            "network_sessions": network.get("http_sessions", []),
            "dns_queries": network.get("dns_lookups", []),
            "filesystem_modifications": filesystem.get("events", []),
            "anti_analysis_evasions": anti_analysis.get("evidence", [])
        }
        return json.dumps(context_object, indent=2)
