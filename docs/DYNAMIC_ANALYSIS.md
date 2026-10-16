
# DYNAMIC_ANALYSIS.md

# Tracelock Dynamic Analysis Engine

Version: 1.0

This document specifies the runtime malware analysis subsystem used by Tracelock. Dynamic analysis executes an APK inside an isolated Android environment to observe real behavior that cannot be reliably inferred through static inspection alone.

---

# Goals

The dynamic engine must:

- Execute APKs safely
- Observe runtime behavior
- Detect sandbox evasion
- Capture network communications
- Monitor filesystem activity
- Record API usage
- Produce structured forensic artifacts

No malware should ever be allowed to interact with the host operating system.

---

# Runtime Pipeline

```
Analysis Job
      │
      ▼
Provision Sandbox
      │
      ▼
Boot Android Emulator
      │
      ▼
Install APK
      │
      ▼
Inject Frida Hooks
      │
      ▼
Start Network Capture
      │
      ▼
Exercise Application
      │
      ▼
Collect Runtime Events
      │
      ▼
Persist Artifacts
```

---

# Sandbox Architecture

Isolation Layers

- Docker container
- gVisor runtime
- Android Emulator (API 30+)
- Ephemeral filesystem
- Disposable network namespace

Each analysis receives a brand-new sandbox.

Containers are destroyed after completion.

---

# Emulator Configuration

Recommended

- Android API 30+
- Google APIs image
- Writable data partition
- Snapshot disabled
- Hardware acceleration when available

Configure deterministic device settings for reproducible results.

---

# Runtime Instrumentation

Primary Tool

- Frida

Hook Categories

- Java APIs
- Native libraries
- SMS APIs
- Accessibility APIs
- Clipboard
- Package Manager
- Runtime permissions
- SSL libraries

Goals

- Observe behavior
- Bypass SSL pinning where appropriate
- Detect hidden execution paths

---

# Network Monitoring

Tools

- mitmproxy
- tcpdump
- Scapy

Capture

- DNS lookups
- HTTP requests
- HTTPS requests
- TLS metadata
- IP addresses
- Ports
- Payload sizes
- Data exfiltration attempts

Artifacts

- network.json
- traffic.pcap

---

# Filesystem Monitoring

Observe

- File creation
- File deletion
- SQLite databases
- Downloads
- SharedPreferences
- External storage access

Artifacts

filesystem.json

---

# Runtime API Monitoring

Track

- SMS reads
- SMS sends
- Accessibility events
- Notification access
- Contacts
- Camera
- Microphone
- Clipboard
- Overlay windows
- Package installation
- Dynamic code loading

Every event should include:

- timestamp
- process
- API name
- arguments (where safe)
- evidence

---

# Anti-Analysis Detection

Detect malware attempting to identify:

- Emulator
- Root
- Frida
- Debugger
- Virtualization
- Test environment

Signals

- Build property checks
- Sensor probing
- Installed package inspection
- Timing attacks
- Emulator fingerprints

Generate

anti_analysis.json

---

# Behavior Classification

Runtime observations should be grouped into categories:

- Credential theft
- OTP interception
- Overlay attacks
- Accessibility abuse
- Remote access
- Data exfiltration
- Command & Control
- Persistence
- Reconnaissance

Each category requires supporting evidence.

---

# Generated Artifacts

- runtime.json
- network.json
- filesystem.json
- anti_analysis.json
- screenshots/
- traffic.pcap
- runtime_summary.json

Artifacts are immutable and versioned.

---

# Failure Handling

If emulator boot fails:

- Retry once
- Record failure reason
- Continue with static-only findings

If Frida fails:

- Continue without hooks
- Mark instrumentation unavailable

If mitmproxy fails:

- Fall back to packet capture only

Pipeline failures must be isolated to the affected module.

---

# Performance Targets

- Sandbox startup < 30s
- APK install < 10s
- Runtime observation: configurable (default 120s)
- Artifact persistence < 5s

---

# Security

- No host networking
- Read-only base images
- Restricted capabilities
- Resource limits
- Automatic container destruction
- Full audit logging

---

# Testing

Test Suites

- Benign applications
- Banking trojans
- RAT samples
- Obfuscated malware
- SSL pinned apps
- Emulator detection samples

Chaos Tests

- Emulator crash
- Packet loss
- Disk full
- Hook failures

---

# Definition of Done

The dynamic analysis engine is complete when:

- Runtime artifacts are generated
- Network capture succeeds
- Isolation is verified
- Failures are recoverable
- Outputs integrate with downstream AI agents
