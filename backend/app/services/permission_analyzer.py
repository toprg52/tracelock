from typing import List, Dict, Any, TypedDict, Optional

class Rule(TypedDict):
    name: str
    description: str
    required_permissions: List[str]
    risk_level: str
    score_weight: int

DEFAULT_RULES: List[Rule] = [
    {
        "name": "Accessibility Abuse & SMS Interception",
        "description": "Combination of accessibility service binding and SMS reading, common in banking trojans.",
        "required_permissions": [
            "android.permission.BIND_ACCESSIBILITY_SERVICE",
            "android.permission.READ_SMS"
        ],
        "risk_level": "CRITICAL",
        "score_weight": 95
    },
    {
        "name": "SMS Silent Capture",
        "description": "Receiving and sending SMS without user knowledge.",
        "required_permissions": [
            "android.permission.RECEIVE_SMS",
            "android.permission.SEND_SMS"
        ],
        "risk_level": "HIGH",
        "score_weight": 80
    },
    {
        "name": "System Alert Window Overlay",
        "description": "Overlay window control coupled with background execution, used for phishing.",
        "required_permissions": [
            "android.permission.SYSTEM_ALERT_WINDOW",
            "android.permission.FOREGROUND_SERVICE"
        ],
        "risk_level": "HIGH",
        "score_weight": 75
    }
]

class PermissionAnalyzer:
    def __init__(self, rules: Optional[List[Rule]] = None):
        self.rules: List[Rule] = rules if rules is not None else DEFAULT_RULES

    def analyze(self, permissions: List[str]) -> Dict[str, Any]:
        matched_rules = []
        max_score = 0
        risk_level = "LOW"
        
        # Clean permission names to handle namespaces
        cleaned_perms = {p.strip() for p in permissions}
        
        for rule in self.rules:
            # Check if all required permissions in rule are present in APK permissions
            reqs = rule["required_permissions"]
            if all(any(req in p for p in cleaned_perms) for req in reqs):
                matched_rules.append(rule)
                if rule["score_weight"] > max_score:
                    max_score = rule["score_weight"]
                    risk_level = rule["risk_level"]
                    
        return {
            "risk_score": max_score,
            "risk_level": risk_level,
            "matched_rules": matched_rules,
            "all_permissions_count": len(permissions)
        }
