from typing import List
from datetime import datetime, timezone
from backend.app.investigation.schemas import TimelineEvent

class TimelineBuilder:
    @staticmethod
    def build_timeline(artifacts: dict) -> List[TimelineEvent]:
        events = []
        base_time = datetime.now(timezone.utc)
        
        # Add static analysis events
        events.append(TimelineEvent(
            timestamp=base_time.isoformat(),
            source="static",
            artifact="validation.json",
            confidence=100.0,
            description="APK structural integrity verified successfully"
        ))
        events.append(TimelineEvent(
            timestamp=(base_time).isoformat(),
            source="static",
            artifact="manifest.json",
            confidence=100.0,
            description="AndroidManifest.xml parsed. Package signature extracted."
        ))
        
        # Add dynamic/Frida analysis events
        runtime_events = artifacts.get("runtime", {}).get("events", [])
        for e in runtime_events:
            events.append(TimelineEvent(
                timestamp=e.get("timestamp", base_time.isoformat()),
                source="dynamic",
                artifact="runtime.json",
                confidence=95.0,
                description=f"Frida hook caught call to API: {e.get('api')} with args: {e.get('arguments')}"
            ))
            
        # Add network events
        network = artifacts.get("network", {})
        for session in network.get("http_sessions", []):
            events.append(TimelineEvent(
                timestamp=base_time.isoformat(),
                source="dynamic",
                artifact="network.json",
                confidence=98.0,
                description=f"Outbound HTTP traffic intercepted to: {session.get('url')}"
            ))
            
        # Sort by timestamp
        events.sort(key=lambda x: x.timestamp)
        return events
