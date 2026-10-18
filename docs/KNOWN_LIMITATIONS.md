# Known Limitations
- Verdicts and risk scores currently come from filename keywords in backend/app/services/apk_analysis_runner.py; real detection is planned.
- IOC extraction is placeholder logic (hardcoded by filename), so IOC-based statements in the UI are preliminary.
- The case page "Why this score" reasons should be based on manifest permissions only and use the wording "static manifest analysis only, not a guarantee of safety" once IOCs are real.
- Frida dynamic analysis output, WebSocket progress events and the campaign graph fallback use simulated data.
- Blockchain anchoring works only when VITE_CONTRACT_ADDRESS is configured; otherwise it shows a demo placeholder.
