from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, Text
from sqlalchemy.sql import func
from backend.app.core.database import Base
from backend.app.models.enums import IssueSeverity, IssueState

class ValidationIssue(Base):
    __tablename__ = "validation_issues"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(String(64), index=True, nullable=False)
    enrolment_id = Column(String(64), nullable=True, index=True)
    row_index = Column(Integer, nullable=True)
    rule_id = Column(String(16), nullable=False, index=True)  # e.g., 'R01', 'R06'
    severity = Column(SQLEnum(IssueSeverity), nullable=False)
    message = Column(Text, nullable=False)
    field_name = Column(String(64), nullable=True)
    raw_value = Column(Text, nullable=True)
    state = Column(SQLEnum(IssueState), default=IssueState.OPEN, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
