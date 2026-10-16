
# API_REFERENCE.md

# Tracelock API Reference

Version: 1.0

This document defines the REST and WebSocket contracts for Tracelock.

---

# API Principles

- RESTful resource naming
- JSON request/response
- JWT authentication
- Versioned endpoints
- Idempotent GET/DELETE
- Consistent error model

Base URL

```
/api/v1
```

---

# Authentication

## POST /auth/login

Authenticate a user.

### Request

```json
{
  "email":"analyst@example.com",
  "password":"********"
}
```

### Response

```json
{
  "access_token":"...",
  "refresh_token":"...",
  "expires_in":3600,
  "role":"analyst"
}
```

Errors

- 400 Invalid payload
- 401 Invalid credentials

---

## POST /auth/refresh

Returns a new access token.

---

## POST /auth/logout

Invalidates the current session.

---

# Upload API

## POST /uploads

Upload an APK.

Consumes

- multipart/form-data

Response

```json
{
  "case_id":"uuid",
  "job_id":"uuid",
  "status":"queued"
}
```

Errors

- Unsupported file
- Duplicate hash
- Upload failed

---

# Case APIs

## GET /cases

List cases.

Supports

- pagination
- sorting
- filtering

Query Parameters

- page
- limit
- status
- risk
- search

---

## GET /cases/{case_id}

Returns

- Metadata
- Static findings
- Dynamic findings
- AI summaries
- Risk score

---

## POST /cases/{case_id}/reanalyze

Queues a fresh analysis.

---

## DELETE /cases/{case_id}

Admin only.

---

# Report APIs

## GET /reports/{case_id}

Returns available reports.

Supported formats

- PDF
- HTML
- JSON

---

## GET /reports/{case_id}/download

Downloads the selected report.

---

# Campaign APIs

## GET /campaigns/{case_id}

Returns related malware graph.

Response

```json
{
  "nodes":[],
  "edges":[]
}
```

---

# System APIs

## GET /health

Health status.

Returns

- database
- redis
- rabbitmq
- workers
- ai_models

---

## GET /metrics

Prometheus metrics endpoint.

---

# Common Response Format

Success

```json
{
  "success":true,
  "data":{}
}
```

Failure

```json
{
  "success":false,
  "error":{
    "code":"CASE_NOT_FOUND",
    "message":"Case not found"
  }
}
```

---

# HTTP Status Codes

200 OK

201 Created

202 Accepted

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

429 Too Many Requests

500 Internal Server Error

503 Service Unavailable

---

# WebSocket API

Endpoint

```
/ws/analysis/{case_id}
```

Events

analysis_started

static_started

static_complete

dynamic_started

dynamic_complete

ai_processing

risk_generated

report_ready

analysis_failed

Payload

```json
{
  "event":"report_ready",
  "case_id":"uuid",
  "progress":100
}
```

---

# Authentication Rules

JWT required for all endpoints except:

- /auth/login
- /health

Role Matrix

| Endpoint | Analyst | Officer | Admin |
|----------|:-------:|:-------:|:-----:|
| Upload | ✓ | ✓ | ✓ |
| View Reports | ✓ | ✓ | ✓ |
| Delete Case | | | ✓ |
| System Metrics | | | ✓ |

---

# Versioning Policy

Current Version

v1

Breaking changes require:

- new version
- migration guide
- deprecation notice

---

# Definition of Done

Every new endpoint must include:

- request schema
- response schema
- authentication
- validation
- OpenAPI documentation
- unit tests
- integration tests
- examples
