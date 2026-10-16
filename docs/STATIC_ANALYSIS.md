
# STATIC_ANALYSIS.md

# Tracelock Static Analysis Engine

Version: 1.0

This document specifies the complete static analysis pipeline used by Tracelock to inspect Android APKs without executing them.

---

# Objectives

The static analysis engine should:

- Extract application metadata
- Identify dangerous permissions
- Reverse engineer bytecode
- Detect Indicators of Compromise (IOCs)
- Evaluate signing certificates
- Measure obfuscation
- Produce structured forensic artifacts

Static analysis is the first stage of the investigation pipeline and should complete before dynamic analysis begins.

---

# Pipeline Overview

```
APK
 │
 ▼
Integrity Validation
 │
 ▼
Manifest Extraction
 │
 ▼
Permission Analysis
 │
 ▼
Certificate Analysis
 │
 ▼
DEX Extraction
 │
 ▼
JADX Decompilation
 │
 ▼
IOC Extraction
 │
 ▼
Semgrep Rules
 │
 ▼
Obfuscation Detection
 │
 ▼
Artifact Generation
```

---

# Step 1 — APK Validation

Checks

- MIME type
- APK structure
- ZIP integrity
- SHA-256 hash
- Duplicate detection

Output

```
validation.json
```

---

# Step 2 — Manifest Parsing

Tool

- Androguard

Extract

- Package name
- Version
- SDK versions
- Activities
- Services
- Receivers
- Providers
- Intent filters

Output

```
manifest.json
```

---

# Step 3 — Permission Risk Analysis

Dangerous permissions include:

- READ_SMS
- RECEIVE_SMS
- SEND_SMS
- READ_CONTACTS
- READ_CALL_LOG
- BIND_ACCESSIBILITY_SERVICE
- SYSTEM_ALERT_WINDOW
- REQUEST_INSTALL_PACKAGES

Rules

- Score permission combinations rather than individual permissions.
- Flag suspicious banking-malware combinations.

Output

```
permissions.json
```

---

# Step 4 — Certificate Intelligence

Extract

- Signing certificate
- SHA-1
- SHA-256
- Issuer
- Subject
- Validity
- Self-signed status

Checks

- Expired certificate
- Reused certificate
- Known malicious fingerprint
- Package spoofing

Output

```
certificate.json
```

---

# Step 5 — DEX Decompilation

Tool

- JADX CLI

Artifacts

- Decompiled Java
- Resource files
- String tables

Store decompiled source separately from generated summaries.

---

# Step 6 — IOC Extraction

Extract

- URLs
- Domains
- IP addresses
- Email addresses
- API keys
- Telegram IDs
- Discord links
- Wallet addresses
- Base64 blobs

Tools

- Regex
- Semgrep
- Custom parsers

Output

```
ioc.json
```

---

# Step 7 — Code Pattern Analysis

Detect

- Reflection
- Dynamic class loading
- Runtime execution
- Native libraries
- Encryption routines
- Accessibility abuse
- SMS interception logic

Generate evidence snippets with file path and line numbers where available.

---

# Step 8 — Obfuscation Analysis

Signals

- Single-character identifiers
- Encrypted strings
- Reflection usage
- Control-flow flattening
- Dynamic loading
- Unused dead code

Produce

- Obfuscation score (0–100)
- Confidence
- Reasons

Output

```
obfuscation.json
```

---

# Generated Artifacts

Each analysis produces:

- validation.json
- manifest.json
- permissions.json
- certificate.json
- ioc.json
- decompiled_summary.json
- obfuscation.json

Artifacts must be immutable.

---

# Error Handling

If a module fails:

- Record failure
- Preserve completed artifacts
- Continue remaining static checks where possible
- Mark artifact status as partial

---

# Performance Targets

- Validation < 1 second
- Manifest parsing < 2 seconds
- Permission analysis < 1 second
- IOC extraction < 5 seconds
- Total static pipeline < 30 seconds (typical APK)

---

# Security Considerations

- Never execute APK code.
- Process files in isolated containers.
- Sanitize extracted strings before rendering.
- Store raw artifacts separately from user-facing summaries.

---

# Testing

Every analyzer requires:

- Unit tests
- Known benign APKs
- Known malware APKs
- Corrupted APK cases
- Large APK stress tests

---

# Definition of Done

The static analysis engine is complete when:

- All artifacts are generated
- Structured JSON validates
- Errors are recoverable
- Performance targets are met
- Outputs integrate with downstream AI agents
