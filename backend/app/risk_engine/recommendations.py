from typing import List

class RecommendationEngine:
    @staticmethod
    def get_recommendations(threat_index: float) -> List[str]:
        if threat_index >= 81:
            return [
                "BLOCK IMMEDIATELY: Restrict network capabilities on host gateways.",
                "NOTIFY SOC: Trigger emergency alert response pager.",
                "PRESERVE EVIDENCE: Export complete memory and dynamic analysis artifacts.",
                "DISABLE ACCOUNT: Lock customer credentials associated with the app."
            ]
        elif threat_index >= 61:
            return [
                "ESCALATE REVIEW: Queue case for manual analyst verification.",
                "MONITOR INFRASTRUCTURE: Track domain targets in C2 logs."
            ]
        elif threat_index >= 41:
            return [
                "MANUAL INVESTIGATION: Recommend checking permissions manifest details."
            ]
        elif threat_index >= 21:
            return [
                "WATCHLIST: Flag developer certificate fingerprint hashes."
            ]
        else:
            return [
                "ARCHIVE: No actions required."
            ]
