try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return self.__dict__

from typing import List, Dict, Any, Optional
from datetime import datetime

class RiskFactor(BaseModel):
    name: str
    weight: float
    raw_value: float
    contribution: float
    rationale: str

class RiskScoreResponse(BaseModel):
    inst_id: str
    academic_year: str
    score: float # 0 to 100
    risk_level: str # LOW, MEDIUM, HIGH, CRITICAL
    factors: List[RiskFactor]
    top_three_reasons: List[str]
    computed_at: datetime
