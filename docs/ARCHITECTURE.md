
# ARCHITECTURE.md

# Tracelock Architecture Guide

Version: 1.0

This document describes the complete software architecture of Tracelock. It explains how data moves through the system, how services communicate, and how new functionality should be integrated without breaking existing modules.

---

# Architectural Principles

- Modular over monolithic
- Event-driven processing
- Asynchronous execution
- Explainable AI
- Zero-trust security
- Horizontal scalability
- Fault isolation
- Immutable forensic artifacts

---

# High-Level Architecture

```
                React Frontend
                       │
             HTTPS / WebSocket
                       │
              FastAPI API Gateway
                       │
              Authentication Layer
                       │
             RabbitMQ Job Queue
              ┌────────┴────────┐
              │                 │
      Static Analysis     Dynamic Analysis
              │                 │
              └────────┬────────┘
                       │
               MinIO Artifact Store
                       │
          LangGraph Orchestrator
                       │
 ┌─────────┬─────────┬──────────┬─────────┬──────────┐
 │         │         │          │         │          │
Deobf   MITRE    Network     GRC      Risk     Reporting
Agent    Agent     Agent      Agent    Engine     Agent
                       │
                Campaign DNA
                    Neo4j
                       │
          PostgreSQL / Redis / MinIO
                       │
               Dashboard & Reports
```

---

# Layered Design

## Layer 0 — Client

Responsibilities

- Authentication
- APK upload
- Case management
- Live progress
- Report visualization
- Campaign graph

Technology

- React
- TypeScript
- Tailwind
- shadcn/ui

---

## Layer 1 — API Gateway

Responsibilities

- Authentication
- Authorization
- Validation
- Rate limiting
- Job creation
- WebSocket updates

Never perform malware analysis here.

The gateway should remain lightweight.

---

## Layer 2 — Queue

RabbitMQ decouples uploads from analysis.

Benefits

- Retry support
- Worker scaling
- Failure isolation
- Independent pipelines

Workers should never communicate directly with one another.

---

## Layer 3 — Static Analysis

Consumes

APK

Produces

- Manifest
- Permissions
- Certificate
- Decompiled code
- IOCs
- Obfuscation score

Tools

- JADX
- Androguard
- Semgrep

---

## Layer 4 — Dynamic Analysis

Runs inside an isolated environment.

Components

- Android Emulator
- Frida
- mitmproxy
- tcpdump
- Filesystem watcher

Produces runtime evidence.

---

## Layer 5 — Artifact Store

Every analysis stage writes immutable JSON artifacts.

Examples

```
manifest.json
permissions.json
network.json
runtime.json
mitre.json
risk.json
```

Artifacts should never be overwritten.

---

## Layer 6 — AI Orchestrator

LangGraph coordinates independent agents.

Execution order

1. Deobfuscation
2. Network Intelligence
3. MITRE Mapping
4. Compliance
5. Risk Scoring
6. Campaign Analysis
7. Report Generation

Agents communicate only through structured context objects.

---

## Layer 7 — Storage

### PostgreSQL

Stores

- Users
- Cases
- Jobs
- Reports
- Risk Scores
- Audit Logs

### Redis

Stores

- Cache
- Queue state
- WebSocket pub/sub
- Session data

### Neo4j

Stores

Nodes

- APK
- Domain
- IP
- Certificate
- Malware Family
- Developer

Relationships

- COMMUNICATES_WITH
- SIGNED_BY
- REUSES_DOMAIN
- BELONGS_TO_CAMPAIGN

### MinIO

Stores

- APKs
- PDFs
- PCAP files
- JSON artifacts

---

# Data Flow

1. User uploads APK.
2. Gateway validates request.
3. Case created.
4. Job placed on RabbitMQ.
5. Static worker executes.
6. Dynamic worker executes.
7. Artifacts stored.
8. LangGraph starts.
9. AI agents enrich findings.
10. Risk score generated.
11. Reports rendered.
12. Dashboard updated.

---

# Failure Strategy

Static failure

→ Continue with dynamic.

Dynamic failure

→ Continue with static.

AI failure

→ Produce deterministic report.

One module failing should never terminate the pipeline.

---

# Scalability

Stateless components

- FastAPI
- Workers
- AI agents

Stateful components

- PostgreSQL
- Neo4j
- Redis
- MinIO

Horizontal scaling priorities

1. Workers
2. RabbitMQ
3. API replicas
4. AI agents

---

# Security

- JWT authentication
- HTTPS everywhere
- Docker isolation
- gVisor sandbox
- Principle of least privilege
- Environment variables for secrets
- Immutable audit trail

---

# Extension Guidelines

When adding a feature:

- Avoid modifying unrelated modules.
- Add a dedicated service if responsibility is new.
- Prefer composition over inheritance.
- Emit structured artifacts.
- Update documentation.
- Add automated tests.

---

# Architecture Decision Records (ADR)

ADR-001
Use FastAPI because async processing is critical.

ADR-002
Use RabbitMQ to decouple ingestion from analysis.

ADR-003
Use LangGraph for deterministic multi-agent orchestration.

ADR-004
Store immutable artifacts in MinIO.

ADR-005
Use Neo4j for campaign intelligence rather than relational joins.

---

# Future Architecture

Planned additions

- Kubernetes deployment
- Multi-region workers
- SIEM connectors
- SOAR integration
- Threat feed ingestion
- Streaming analysis
- Federated intelligence
- Multi-tenant deployment
