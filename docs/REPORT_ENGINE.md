
# REPORT_ENGINE.md

# Tracelock Report Generation Engine

Version: 1.0

This document defines how Tracelock transforms forensic artifacts into clear, role-specific investigation reports.

---

# Objectives

The Report Engine must:

- Generate explainable reports from structured artifacts
- Support multiple stakeholder personas
- Preserve evidence traceability
- Produce reproducible outputs
- Export reports in multiple formats

The Report Engine performs **presentation only**. It must never introduce new analysis or modify the Risk Engine's conclusions.

---

# Report Pipeline

```
Analysis Artifacts
        │
        ▼
Context Builder
        │
        ▼
Template Selection
        │
        ▼
Evidence Mapping
        │
        ▼
Section Rendering
        │
        ▼
PDF / HTML / JSON Export
        │
        ▼
Storage + Notification
```

---

# Supported Report Types

## Analyst Report

Audience

- SOC Analysts
- Malware Researchers
- Incident Responders

Includes

- Case metadata
- APK information
- Static findings
- Dynamic findings
- MITRE ATT&CK mapping
- IOC catalogue
- Threat Index
- Full evidence references
- Recommended actions

---

## Executive Summary

Audience

- CISO
- Banking Leadership
- Management

Focus

- Threat overview
- Business impact
- Customer exposure
- Overall risk
- Executive recommendations

Avoid low-level reverse engineering details.

---

## Compliance Report

Audience

- Compliance Officers
- Auditors
- Regulators

Sections

- Regulatory mappings
- DPDP impact
- RBI implications
- IT Act references
- Audit trail
- Evidence integrity

---

## Customer Advisory

Audience

- End users
- Banking customers

Content

- Plain-language explanation
- Indicators of compromise
- Protective actions
- Bank contact information

Avoid technical jargon.

---

# Report Sections

Every report begins with:

- Report ID
- Case ID
- Timestamp
- Version
- Analyst / System
- Classification

Core Sections

1. Executive Summary
2. APK Metadata
3. Static Analysis
4. Dynamic Analysis
5. AI Interpretation
6. Risk Assessment
7. Recommendations
8. Appendix

---

# Evidence Traceability

Every statement should reference one or more artifacts.

Example

Finding:
Accessibility service abuse detected.

Evidence:
runtime.json
permissions.json
mitre.json

Never include unsupported claims.

---

# Export Formats

Current

- PDF
- HTML
- JSON

Planned

- CSV
- STIX
- TAXII
- Sigma
- YARA
- Markdown

---

# PDF Generation

Recommended

- Jinja2 templates
- WeasyPrint

Requirements

- Consistent branding
- Clickable table of contents
- Page numbers
- Embedded metadata

---

# HTML Rendering

Requirements

- Responsive layout
- Printable
- Dark/light support
- Accessible tables

---

# Localization

Future Languages

- English
- Hindi
- Kannada
- Telugu
- Tamil
- Malayalam

Report content should be translatable through template strings rather than hard-coded text.

---

# Versioning

Every report stores:

- report_version
- template_version
- scoring_version
- ai_model_version

This ensures future reproducibility.

---

# Digital Integrity

Recommended

- SHA-256 report hash
- Timestamp
- Blockchain anchor (future/optional)
- Immutable storage

---

# Storage Layout

reports/

reports/{case_id}/analyst.pdf

reports/{case_id}/executive.pdf

reports/{case_id}/compliance.pdf

reports/{case_id}/customer.html

---

# Failure Handling

If PDF generation fails:

- Preserve JSON output
- Retry rendering
- Notify user
- Log failure

Never lose analysis artifacts because rendering failed.

---

# Testing

Validate

- Template rendering
- Missing fields
- Long reports
- Unicode support
- PDF generation
- HTML rendering

Regression tests should compare generated reports against approved snapshots.

---

# Definition of Done

The Report Engine is complete when:

- All report types render successfully
- Evidence references are preserved
- Multiple export formats are supported
- Templates are versioned
- Reports are reproducible
- Tests pass
