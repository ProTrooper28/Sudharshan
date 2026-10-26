from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from sqlalchemy.sql import func
import hashlib
import json
from datetime import datetime, timezone
from backend.app.core.database import Base

class AuditRecord(Base):
    """
    Cryptographic Hash-Chained Audit Trail for AICTE Actions.
    Guarantees immutability and non-repudiation for review decisions,
    batch submissions, and enrolment overrides.
    """
    __tablename__ = "audit_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String(64), nullable=False, index=True) # e.g. REVIEW_DECISION, BATCH_SUBMISSION
    entity_id = Column(String(64), nullable=False, index=True)
    actor = Column(String(64), nullable=False) # e.g. AICTE-OFFICER-042
    details = Column(JSON, nullable=True)
    prev_hash = Column(String(64), nullable=False)
    record_hash = Column(String(64), nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

def compute_audit_hash(prev_hash: str, event_type: str, entity_id: str, actor: str, details: dict, timestamp_str: str) -> str:
    canonical_payload = json.dumps({
        "prev_hash": prev_hash,
        "event_type": event_type,
        "entity_id": str(entity_id),
        "actor": actor,
        "details": details or {},
        "timestamp": timestamp_str
    }, sort_keys=True)
    return hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()

