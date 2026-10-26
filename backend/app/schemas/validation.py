try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__
    def Field(*args, **kwargs):
        return None

from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.models.enums import IssueSeverity, IssueState


class ValidationIssueSchema(BaseModel):
    id: Optional[int] = None
    batch_id: str
    enrolment_id: Optional[str] = None
    row_index: Optional[int] = None          # ← preserved for export-failed
    rule_id: str
    severity: IssueSeverity
    message: str
    field_name: Optional[str] = None
    raw_value: Optional[str] = None
    state: IssueState = IssueState.OPEN
    created_at: Optional[datetime] = None


class ValidationSummary(BaseModel):
    total_rows: int
    valid_rows: int
    failed_rows: int
    block_count: int
    critical_count: int
    error_count: int
    warn_count: int
    flag_count: int
    can_proceed: bool  # False if block_count > 0 or critical_count > 0


class BatchValidationReport(BaseModel):
    batch_id: str
    inst_id: str
    summary: ValidationSummary
    issues: List[ValidationIssueSchema]
