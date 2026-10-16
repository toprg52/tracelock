
# FRONTEND.md

# Tracelock Frontend Engineering Guide

Version: 1.0

This document defines the frontend architecture, UI standards, component organization,
and engineering practices for the Tracelock web application.

---

# Frontend Goals

The frontend should:

- Be responsive and accessible
- Present complex security information clearly
- Stream analysis progress in real time
- Separate presentation from business logic
- Remain modular and scalable

---

# Technology Stack

Framework
- React 18
- TypeScript

Styling
- Tailwind CSS
- shadcn/ui

Charts
- Recharts
- D3.js

Graphs
- Sigma.js / react-force-graph

Communication
- REST API
- WebSockets

---

# Suggested Folder Structure

frontend/
├── app/
├── pages/
├── components/
├── layouts/
├── hooks/
├── services/
├── lib/
├── context/
├── store/
├── types/
├── assets/
├── styles/
└── tests/

Every component should have a single responsibility.

---

# Page Architecture

Dashboard

- KPI cards
- Risk distribution
- Recent cases
- Live queue

Case Details

- Metadata
- Static findings
- Dynamic findings
- AI explanation
- Reports

Campaign Graph

- Neo4j visualization
- IOC relationships

Settings

- User profile
- API keys (admin)
- Preferences

---

# Component Guidelines

Use:

- Small reusable components
- Functional components
- Typed props

Avoid:

- Large page-sized components
- Business logic inside JSX
- Deep prop drilling

---

# State Management

Local State

- useState

Shared UI State

- Context API

Server State

- React Query (recommended)

Realtime State

- WebSocket event handlers

---

# API Layer

All HTTP requests should be wrapped in service modules.

Example:

services/
- auth.ts
- cases.ts
- reports.ts
- uploads.ts
- campaigns.ts

Components must never call fetch() directly.

---

# WebSocket Events

Supported events

- analysis_started
- static_complete
- dynamic_complete
- ai_processing
- report_ready
- analysis_failed

The UI should gracefully recover from disconnects.

---

# Dashboard Widgets

- Active analyses
- Queue depth
- Threat score histogram
- Risk breakdown
- Recent uploads
- Campaign graph
- AI agent status

Widgets should be independently reusable.

---

# Visual Design

Theme

- Clean security dashboard
- Minimal clutter
- Accessible colors
- Consistent spacing

Cards

- Rounded
- Shadowed
- Responsive

Tables

- Sortable
- Filterable
- Paginated

---

# Accessibility

- Keyboard navigation
- Screen reader labels
- Focus indicators
- Contrast compliance
- Semantic HTML

---

# Performance

- Lazy load routes
- Memoize expensive charts
- Virtualize large tables
- Cache API responses
- Debounce search

---

# Error Handling

Display friendly errors.

Never expose backend exceptions.

Retry transient network failures.

Provide loading and empty states.

---

# Testing

Every component should include:

- Render test
- Interaction test
- Accessibility test

Pages should include integration tests.

---

# Frontend Definition of Done

A frontend feature is complete only if:

- Responsive on desktop
- Accessible
- Typed
- API integrated
- Error states handled
- Loading states implemented
- Tests updated
- Documentation updated
