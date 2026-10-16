
# DATABASE_SCHEMA.md

# Tracelock Data Architecture

Version: 1.0

This document defines the persistent storage architecture for Tracelock,
including PostgreSQL, Neo4j, Redis, and MinIO.

---

# Storage Overview

Tracelock uses a polyglot persistence architecture.

| Storage | Purpose |
|---------|---------|
| PostgreSQL | Transactional application data |
| Neo4j | Malware relationship graph |
| Redis | Cache, sessions, pub/sub |
| MinIO | APKs, reports, artifacts |

---

# PostgreSQL Tables

## users

Fields

- id (UUID)
- email
- password_hash
- role
- created_at
- last_login

Indexes

- email (unique)

---

## cases

Fields

- id
- case_number
- uploader_id
- sha256
- filename
- status
- created_at

Relationships

- users → cases (1:N)

Indexes

- sha256
- status
- created_at

---

## analysis_jobs

Fields

- id
- case_id
- worker
- state
- started_at
- finished_at
- duration_ms

---

## risk_scores

Fields

- id
- case_id
- score
- confidence
- category
- explanation_json

---

## reports

Fields

- id
- case_id
- report_type
- object_key
- generated_at

---

## audit_logs

Fields

- id
- actor
- action
- resource
- timestamp
- metadata_json

---

# Suggested ER Diagram

users
  │
  └──────< cases
              │
              ├──────< analysis_jobs
              ├──────< risk_scores
              ├──────< reports
              └──────< audit_logs

---

# JSON Columns

Recommended JSONB fields

- manifest_json
- permissions_json
- runtime_json
- network_json
- evidence_json

Keep large binary objects outside PostgreSQL.

---

# Neo4j Model

## Nodes

APK

Certificate

Domain

IP

URL

Developer

MalwareFamily

Campaign

---

## Relationships

(APK)-[:SIGNED_BY]->(Certificate)

(APK)-[:CONTACTS]->(Domain)

(Domain)-[:RESOLVES_TO]->(IP)

(APK)-[:BELONGS_TO]->(Campaign)

(APK)-[:SIMILAR_TO]->(APK)

---

# Example Cypher

MATCH (a:APK)-[:CONTACTS]->(d:Domain)
RETURN a,d

---

# Redis Usage

Keys

session:{user}

job:{id}

progress:{case}

cache:vt:{sha256}

Pub/Sub

analysis_started

analysis_progress

report_ready

analysis_failed

---

# MinIO Layout

apks/

reports/

artifacts/

pcaps/

screenshots/

logs/

Example

artifacts/{case_id}/manifest.json

artifacts/{case_id}/runtime.json

reports/{case_id}/analyst.pdf

---

# Retention

APKs

180 days

Artifacts

365 days

Audit Logs

7 years

Cache

24 hours

---

# Backup Strategy

PostgreSQL

- Daily full backup
- Hourly WAL archive

Neo4j

- Nightly dump

MinIO

- Versioning enabled
- Object replication

Redis

- Snapshot every hour

---

# Migration Rules

- Alembic only
- Never edit production schema manually
- Every migration reversible
- Test migrations on staging

---

# Performance

Indexes

- sha256
- case_number
- status
- created_at

Partition large audit tables by month.

Use JSONB GIN indexes for evidence searches.

---

# Security

- Encrypt backups
- Least-privilege database users
- TLS for all database connections
- Secrets from environment variables
- Immutable audit logs

---

# Definition of Done

Database work is complete only if:

- Migration written
- Rollback verified
- Indexes reviewed
- Constraints added
- Documentation updated
- Backup impact assessed
