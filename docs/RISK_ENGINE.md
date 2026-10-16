
# RISK_ENGINE.md

# Tracelock Explainable Risk Engine

Version: 1.0

This document specifies the Threat Index computation engine responsible for converting
technical evidence into an explainable, auditable risk assessment.

---

# Objectives

The Risk Engine must:

- Produce a numeric Threat Index (0–100)
- Explain every score with supporting evidence
- Combine static, dynamic, graph, and AI findings
- Remain deterministic and reproducible
- Support future calibration without breaking reports

---

# Design Principles

- Evidence over intuition
- Deterministic first, AI second
- Explain every point awarded
- Confidence separate from severity
- Modular scoring dimensions

---

# Inputs

Static Analysis
- Permission profile
- Manifest metadata
- Certificate reputation
- Obfuscation score
- IOC extraction

Dynamic Analysis
- Runtime events
- Network traffic
- Filesystem activity
- Anti-analysis behavior

AI Outputs
- Threat narrative
- MITRE mappings
- Compliance findings
- Campaign relationships

Threat Intelligence
- IOC reputation
- Known malware families
- Certificate reputation

---

# Threat Index

Range

0–20   Safe

21–40  Low

41–60  Medium

61–80  High

81–100 Critical

---

# Suggested Scoring Dimensions

| Dimension | Suggested Weight |
|-----------|-----------------:|
| Permission Risk | 15 |
| Runtime Behavior | 25 |
| Network Activity | 15 |
| Obfuscation | 10 |
| Certificate Intelligence | 10 |
| IOC Reputation | 10 |
| MITRE Severity | 5 |
| Campaign DNA | 5 |
| AI Confidence Bonus | 5 |

Weights should be configurable rather than hard-coded.

---

# Evidence Attribution

Every score contribution must include:

- source module
- evidence identifier
- rationale
- weight
- confidence

Example

Permission Combination
+12

Evidence:
READ_SMS +
BIND_ACCESSIBILITY_SERVICE

---

# Confidence Score

Confidence depends on:

- Number of independent signals
- Cross-layer confirmation
- Threat intelligence matches
- AI agreement
- Artifact completeness

Confidence is reported separately from Threat Index.

---

# Explainability Model

Every report should answer:

Why is this score high?

Which artifacts contributed?

What evidence supports the finding?

Which behaviors are most dangerous?

What should an analyst investigate first?

---

# Recommendation Engine

Recommendations are generated from evidence.

Examples

Critical

- Block application
- Notify SOC
- Begin incident response
- Alert customers

High

- Escalate investigation
- Monitor infrastructure
- Preserve evidence

Medium

- Manual analyst review

Low

- Watchlist

Safe

- Archive

---

# False Positive Mitigation

Reduce score when:

- Legitimate enterprise certificates
- Benign runtime
- Weak evidence
- Conflicting indicators

Never suppress evidence—only adjust confidence or score.

---

# Output Schema

{
  "threat_index": 87,
  "risk_category": "Critical",
  "confidence": 0.94,
  "contributors": [],
  "recommendations": [],
  "evidence": []
}

---

# Calibration

Risk weights should be versioned.

Every scoring update should include:

- version
- rationale
- migration notes
- benchmark results

---

# Testing

Unit Tests

- Individual dimensions
- Weight calculations
- Confidence calculations

Integration Tests

- Full malware pipeline
- Benign APK baseline
- Regression suite

---

# Definition of Done

The Risk Engine is complete when:

- Threat Index is reproducible
- Every score is explainable
- Confidence is calculated
- Evidence is traceable
- Recommendations are generated
- Tests pass
