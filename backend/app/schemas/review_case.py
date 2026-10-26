try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__

from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.models.enums import ReviewCaseType, ReviewDecision

class ReviewCaseCreate(BaseModel):
    case_type: ReviewCaseType
    inst_id: str
    academic_year: str
    enrolment_ids: List[str]
    details: Optional[Dict[str, Any]] = None

class ReviewCaseDecisionRequest(BaseModel):
    decision: ReviewDecision
    note: Optional[str] = None
    decided_by: str

class ReviewCaseResponse(BaseModel):
    id: int
    case_type: ReviewCaseType
    inst_id: str
    academic_year: str
    enrolment_ids: List[str]
    details: Optional[Dict[str, Any]] = None
    decision: ReviewDecision
    decided_by: Optional[str] = None
    decided_at: Optional[datetime] = None
    note: Optional[str] = None
    created_at: datetime
