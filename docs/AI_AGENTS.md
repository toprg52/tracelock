
# AI_AGENTS.md

# Tracelock AI Agent Specification

Version: 1.0

This document specifies every AI agent in Tracelock, how agents communicate,
their inputs, outputs, responsibilities, guardrails, and implementation rules.

---

# Design Principles

The AI layer augments deterministic malware analysis.

AI must never invent evidence.

Every conclusion should reference one or more deterministic artifacts.

---

# LangGraph Pipeline

```
Artifacts
    │
    ▼
Context Builder
    │
    ▼
Deobfuscation Agent
    │
    ▼
Network Intelligence Agent
    │
    ▼
MITRE Mapping Agent
    │
    ▼
Compliance Agent
    │
    ▼
Risk Agent
    │
    ▼
Campaign Agent
    │
    ▼
Report Agent
```

Each node consumes JSON and emits JSON.

---

# Shared Context Object

Every agent receives:

- case_id
- apk_metadata
- manifest
- permissions
- certificates
- iocs
- decompiled_code_summary
- runtime_events
- network_events
- filesystem_events
- previous_agent_outputs

No agent should read raw databases directly.

---

# Agent Contract

Each agent must expose:

- name
- version
- description
- input_schema
- output_schema
- execute(context)
- validate(output)

---

# Deobfuscation Agent

Purpose

Explain obfuscated code in plain language.

Input

- Decompiled source
- Strings
- Call graph

Output

- Behavioral summary
- Suspicious functions
- Confidence score

Preferred Models

1. Gemini
2. GPT-4o-mini
3. CodeLlama (local)

Guardrails

- Never invent APIs.
- Quote only observed behavior.

---

# Network Intelligence Agent

Purpose

Interpret network traffic.

Consumes

- PCAP
- mitmproxy logs
- DNS
- HTTP(S)

Produces

- C2 endpoints
- Data exfiltration summary
- Reputation hints

---

# MITRE ATT&CK Agent

Purpose

Map behaviors to ATT&CK Mobile techniques.

Output

{
  "techniques": [],
  "confidence": 0.0,
  "evidence": []
}

Rules

Only map behaviors supported by evidence.

---

# Compliance Agent

Frameworks

- RBI
- DPDP Act
- IT Act

Produces

- Applicable clauses
- Compliance impact
- Suggested actions

---

# Risk Agent

Purpose

Generate explainable Threat Index.

Inputs

- Static findings
- Dynamic findings
- AI summaries
- IOC confidence

Output

Threat Index

Risk Category

Evidence Map

Recommendations

Never output a score without an explanation.

---

# Campaign Agent

Purpose

Correlate samples using Neo4j.

Nodes

- APK
- Domain
- IP
- Certificate
- Developer

Relationships

- SHARES_CERT
- REUSES_DOMAIN
- CONTACTS_IP
- PART_OF_CAMPAIGN

---

# Report Agent

Produces

- Analyst PDF
- Executive Summary
- Compliance Report
- Customer Advisory

Responsibilities

Merge outputs from all previous agents.

Do not perform new analysis.

---

# Prompt Engineering

System prompts should:

- Define the agent role.
- Restrict outputs to structured JSON.
- Require evidence references.
- Avoid speculation.

Prompts must be version-controlled.

---

# Fallback Strategy

If the primary model fails:

Gemini
↓

GPT-4o-mini
↓

Llama 3
↓

Local CodeLlama

Never fail the entire pipeline because of one model.

---

# Confidence Scores

Every agent returns:

- confidence
- evidence_count
- warnings

Confidence should decrease when evidence is weak.

---

# Failure Handling

If an agent errors:

- Log error
- Preserve artifacts
- Continue downstream where possible
- Mark output as partial

---

# Adding New Agents

Checklist

- Define responsibility
- Add schema
- Register in LangGraph
- Write prompt
- Add tests
- Update documentation

Avoid agents with overlapping responsibilities.

---

# Definition of Done

A new AI agent is complete only if:

- Deterministic inputs documented
- Prompt reviewed
- JSON schema validated
- Retry logic implemented
- Tests written
- Integrated into orchestration
