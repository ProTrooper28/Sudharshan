from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from backend.app.models.enums import IssueSeverity

@dataclass
class ValidationIssueResult:
    rule_id: str
    severity: IssueSeverity
    message: str
    row_index: Optional[int] = None
    enrolment_id: Optional[str] = None
    field_name: Optional[str] = None
    raw_value: Optional[str] = None

class BaseRule(ABC):
    rule_id: str
    name: str
    default_severity: IssueSeverity
    description: str

    @abstractmethod
    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        """
        Executes validation rule on the batch of student records.
        :param batch_data: List of student records (e.g. parsed from CSV or API)
        :param context: Context dictionary containing inst_id, seat_config, db session, etc.
        :return: List of ValidationIssueResult
        """
        pass
