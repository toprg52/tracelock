
# AGENTS.md

> Tracelock AI Coding Agent Instructions
>
> Version: 1.0
> Audience: Claude Code, Cursor, Antigravity, OpenHands, Codex, Gemini CLI, Cline, Roo Code

---

# Mission

Tracelock is an AI-powered banking malware investigation platform focused on fraudulent Android APKs.

The objective is **not simply malware detection**.

The system performs an end-to-end investigation pipeline:

1. APK Ingestion
2. Static Analysis
3. Dynamic Analysis
4. AI Multi-Agent Interpretation
5. Explainable Risk Scoring
6. Report Generation
7. Campaign Intelligence

Every code contribution should strengthen this pipeline.

---

# Core Principles

- Security first.
- Never sacrifice explainability for accuracy.
- Every AI decision must be backed by deterministic evidence where possible.
- Modular architecture over monoliths.
- Async-first backend.
- Type-safe frontend.
- Every feature should be independently testable.

---

# Repository Philosophy

Every module should have **one responsibility**.

Good:

backend/
workers/
agents/
risk_engine/
reports/
frontend/

Bad:

utils.py containing hundreds of unrelated functions.

---

# Architecture

Client (React)

↓

FastAPI Gateway

↓

RabbitMQ

↓

Static Worker
Dynamic Worker

↓

Artifact Storage (MinIO)

↓

LangGraph Multi-Agent System

↓

Risk Engine

↓

Report Generator

↓

PostgreSQL
Neo4j
Redis

---

# Primary Features

## APK Intake

Responsibilities

- Upload APK
- Validate MIME
- Calculate SHA256
- VirusTotal lookup
- Create Case ID
- Store APK
- Queue analysis

Expected output

- Case record
- Job ID

---

## Static Analysis

Responsibilities

- Manifest parsing
- Permission extraction
- Certificate analysis
- DEX extraction
- JADX decompilation
- IOC extraction
- Semgrep analysis
- Obfuscation detection

Output

Structured Static Report

---

## Dynamic Analysis

Responsibilities

- Android Emulator
- Frida
- SSL pinning bypass
- mitmproxy
- tcpdump
- Runtime monitoring
- Filesystem monitoring

Output

Behaviour Report

---

## AI Agents

Current agents

- Deobfuscation Agent
- MITRE Agent
- Network Intelligence Agent
- Compliance Agent
- Risk Agent
- Campaign Agent
- Report Agent

Never merge agents together.

Each agent should remain independently callable.

---

# Coding Standards

Python

- Python 3.12+
- Full typing
- Black formatting
- Ruff linting
- Async wherever applicable

Frontend

- React
- TypeScript
- Functional components
- No inline business logic

Database

- Alembic migrations only
- Never modify schema manually

---

# Rules for AI Coding Agents

DO

- Read surrounding files before editing.
- Preserve API contracts.
- Keep functions under ~75 lines when practical.
- Add docstrings to public APIs.
- Write tests for new behaviour.

DO NOT

- Remove logging.
- Hardcode API keys.
- Break backward compatibility.
- Rewrite unrelated files.
- Rename public endpoints without approval.

---

# Environment Variables

DATABASE_URL
REDIS_URL
RABBITMQ_URL
MINIO_ENDPOINT
JWT_SECRET
OPENROUTER_API_KEY
GOOGLE_API_KEY
VT_API_KEY
NEO4J_URI

---

# Definition of Done

A task is complete only if:

- Code builds.
- Tests pass.
- No lint errors.
- Documentation updated.
- Feature integrates with pipeline.
- No regression introduced.

---

# Future Expansion

Upcoming modules include:

- Batch APK analysis
- YARA generation
- STIX/TAXII export
- SIEM integration
- SOAR integration
- Multi-bank intelligence
- Threat hunting dashboard
- Analyst copilot
- Customer advisory engine

