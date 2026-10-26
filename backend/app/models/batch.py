from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
import enum
from backend.app.core.database import Base

class BatchState(str, enum.Enum):
    DRAFT = "draft"
    VALIDATED = "validated"
    SUBMITTED = "submitted"
    LOCKED = "locked"

class SubmissionBatch(Base):
    __tablename__ = "submission_batches"

    batch_id = Column(String(64), primary_key=True, index=True)
    inst_id = Column(String(64), index=True, nullable=False)
    source = Column(String(16), default="csv") # csv, excel, api, form
    row_count = Column(Integer, default=0, nullable=False)
    batch_hash = Column(String(64), nullable=True) # SHA-256 hash for immutability
    state = Column(SQLEnum(BatchState), default=BatchState.DRAFT, nullable=False)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
