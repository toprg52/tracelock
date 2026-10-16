import re
from typing import List, Dict, Any

class ObfuscationService:
    @staticmethod
    def analyze_strings(strings: List[str]) -> Dict[str, Any]:
        single_char_identifiers = 0
        encrypted_patterns = 0
        reflection_calls = 0
        
        # Heuristic markers
        reflection_regex = re.compile(r'Class\.forName|getMethod|getDeclaredMethod|invoke')
        base64_regex = re.compile(r'^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$')
        
        for s in strings:
            if len(s) == 1:
                single_char_identifiers += 1
            if reflection_regex.search(s):
                reflection_calls += 1
            if len(s) > 16 and base64_regex.match(s):
                encrypted_patterns += 1
                
        # Calculate heuristics score 0 - 100
        score = 0
        reasons = []
        if single_char_identifiers > 100:
            score += 30
            reasons.append(f"High count of single character string identifiers ({single_char_identifiers})")
        if reflection_calls > 10:
            score += 30
            reasons.append(f"Frequent reflection invoke targets found ({reflection_calls})")
        if encrypted_patterns > 5:
            score += 40
            reasons.append(f"Encrypted/Base64 resource payloads detected ({encrypted_patterns})")
            
        score = min(score, 100)
        
        return {
            "obfuscation_score": score,
            "confidence": 90 if score > 0 else 50,
            "reasons": reasons,
            "metrics": {
                "single_char_count": single_char_identifiers,
                "reflection_targets_count": reflection_calls,
                "encrypted_payloads_count": encrypted_patterns
            }
        }
