import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="analyst") # analyst, officer, admin
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = Column(DateTime, nullable=True)

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String, unique=True, index=True)
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    sha256 = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    status = Column(String, default="queued") # queued, analyzing, completed, failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Store JSON reports directly using PG JSONB
    manifest_json = Column(JSON, nullable=True)
    permissions_json = Column(JSON, nullable=True)
    runtime_json = Column(JSON, nullable=True)
    network_json = Column(JSON, nullable=True)
    evidence_json = Column(JSON, nullable=True)
    blockchain_tx_hash = Column(String, nullable=True)
    blockchain_block = Column(Integer, nullable=True)
    blockchain_timestamp = Column(DateTime, nullable=True)

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    worker = Column(String, nullable=False) # static, dynamic, report, notification
    state = Column(String, default="pending") # pending, processing, completed, failed
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    score = Column(Integer, nullable=False)
    confidence = Column(Integer, nullable=False)
    category = Column(String, nullable=False) # e.g. clean, low, medium, high, critical
    explanation_json = Column(JSON, nullable=True)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    report_type = Column(String, nullable=False) # analyst, executive, compliance, customer_advisory
    object_key = Column(String, nullable=False) # minio storage key
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    metadata_json = Column(JSON, nullable=True)
