import re
from typing import Dict, List, Any

# Define extractor plugins using regex
PLUGINS = {
    "ip": {
        "pattern": r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b',
        "severity": "HIGH"
    },
    "url": {
        "pattern": r'https?://[a-zA-Z0-9\-._~:/?#\[\]@!$&\'()*+,;=%]+',
        "severity": "MEDIUM"
    },
    "email": {
        "pattern": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "severity": "LOW"
    },
    "telegram": {
        "pattern": r'(?:t\.me|telegram\.me)/[A-Za-z0-9_]{5,100}',
        "severity": "HIGH"
    },
    "discord": {
        "pattern": r'discord\.(?:gg|com/invite)/[A-Za-z0-9]+',
        "severity": "HIGH"
    },
    "crypto_wallet": {
        "pattern": r'\b(?:0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b',
        "severity": "MEDIUM"
    }
}

class IocExtractor:
    @staticmethod
    def extract_from_text(text: str) -> List[Dict[str, Any]]:
        findings = []
        for name, plugin in PLUGINS.items():
            matches = re.findall(plugin["pattern"], text)
            # Remove duplicates
            for value in set(matches):
                findings.append({
                    "type": name.upper(),
                    "value": value,
                    "severity": plugin["severity"]
                })
        return findings
