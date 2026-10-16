import os
from typing import Dict, Any

class BrandingManager:
    @staticmethod
    def get_branding(bank_name: str | None = None) -> Dict[str, Any]:
        resolved_bank = bank_name or os.getenv("BRAND_ORG_NAME", "Cedarline Bank")
        return {
            "bank_name": resolved_bank,
            "logo_url": "/assets/brand_logo.png",
            "primary_color": "#0F172A",
            "secondary_color": "#3B82F6",
            "footer_text": "CONFIDENTIAL // TRACELOCK SECURITY THREAT INTELLIGENCE",
            "watermark": "RESTRICTED DISTRIBUTION"
        }
