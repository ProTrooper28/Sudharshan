from sqlalchemy import Column, String, Integer, DateTime, JSON, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from backend.app.core.database import Base
from backend.app.models.enums import ReviewCaseType, ReviewDecision

class ReviewCase(Base):
    __tablename__ = "review_cases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    case_type = Column(SQLEnum(ReviewCaseType), nullable=False, index=True)
    inst_id = Column(String(64), nullable=False, index=True)
    academic_year = Column(String(16), nullable=False, index=True)
    enrolment_ids = Column(JSON, nullable=False)  # List of enrolment IDs involved
    details = Column(JSON, nullable=True)        # Context payload, e.g. similarity scores or clash dates
    decision = Column(SQLEnum(ReviewDecision), default=ReviewDecision.PENDING, nullable=False)
    decided_by = Column(String(64), nullable=True)
    decided_at = Column(DateTime(timezone=True), nullable=True)
    note = Column(Text, nullable=True)
    audit_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
