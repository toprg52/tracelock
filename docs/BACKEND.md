
# BACKEND.md

# Tracelock Backend Engineering Guide

Version: 1.0

This document defines the backend architecture, coding standards, project structure,
service boundaries, and implementation guidelines for Tracelock.

---

# Backend Philosophy

The backend is responsible for:

- Secure API access
- Case lifecycle management
- Analysis orchestration
- AI workflow coordination
- Report generation
- Persistence
- Audit logging

The backend must **never** contain frontend rendering logic.

---

# Technology Stack

Framework
- FastAPI

Language
- Python 3.12+

Validation
- Pydantic v2

Authentication
- OAuth2
- JWT

ORM
- SQLAlchemy 2.x

Migrations
- Alembic

Queue
- RabbitMQ
- Celery

Cache
- Redis

Storage
- PostgreSQL
- Neo4j
- MinIO

---

# Recommended Folder Structure

backend/
├── api/
├── routers/
├── services/
├── repositories/
├── models/
├── schemas/
├── core/
├── middleware/
├── workers/
├── agents/
├── sandbox/
├── reports/
├── risk_engine/
├── utils/
├── tests/
└── main.py

Each folder owns a single responsibility.

---

# Request Lifecycle

Client Request
    ↓
Router
    ↓
Schema Validation
    ↓
Authentication
    ↓
Service Layer
    ↓
Repository Layer
    ↓
Database

Business logic belongs ONLY inside services.

---

# Router Responsibilities

Routers should:

- Parse requests
- Validate payloads
- Call services
- Return responses

Routers should NEVER:

- Query database directly
- Call AI models
- Perform malware analysis

---

# Service Layer

Services contain business logic.

Example services

- AuthService
- UploadService
- CaseService
- StaticAnalysisService
- DynamicAnalysisService
- ReportService
- RiskService
- CampaignService

Services should be reusable.

---

# Repository Layer

Repositories communicate with databases.

Responsibilities

- CRUD
- Transactions
- Pagination
- Filtering

Repositories must not contain business rules.

---

# Worker Architecture

Workers consume RabbitMQ jobs.

Current workers

- Static Worker
- Dynamic Worker
- Report Worker

Future workers

- Threat Feed Worker
- Batch Worker
- Notification Worker

Workers must be idempotent.

---

# API Modules

/auth
    login
    logout
    refresh

/upload
    create upload
    validate

/cases
    list
    search
    status
    delete

/reports
    generate
    download

/campaigns
    graph
    related samples

/system
    health
    metrics

---

# Error Handling

Standard response format

{
  "success": false,
  "error": {
    "code": "CASE_NOT_FOUND",
    "message": "Case does not exist"
  }
}

Never expose stack traces to clients.

---

# Logging

Use structured logging.

Every request should include:

- request_id
- user_id
- case_id
- timestamp

Log levels

DEBUG
INFO
WARNING
ERROR
CRITICAL

---

# Configuration

Never hardcode values.

Use environment variables for:

- API keys
- Secrets
- Database URLs
- Queue URLs
- Storage credentials

Centralize configuration under core/config.py.

---

# Security Checklist

- JWT validation
- Password hashing
- HTTPS only
- Input validation
- SQL injection protection
- Rate limiting
- Audit trail
- RBAC enforcement

---

# Coding Standards

Functions
- Small and focused
- Type hints required
- Docstrings for public methods

Classes
- Single responsibility

Imports
- Absolute imports preferred

Exceptions
- Raise domain-specific exceptions

---

# Testing Strategy

Every service should include:

- Unit tests
- Integration tests
- Mock external APIs
- Failure path tests

Coverage target

> 85%

---

# Deployment Notes

Run API

uvicorn backend.main:app --reload

Run workers

celery -A backend.workers worker

Database migrations

alembic upgrade head

Docker

docker compose up

---

# Backend Definition of Done

A backend feature is complete only when:

- API implemented
- Validation added
- Tests written
- Documentation updated
- Logging included
- Error handling complete
- Security reviewed
