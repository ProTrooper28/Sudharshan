from backend.app.models.enums import (
    IssueSeverity,
    IssueState,
    ReviewCaseType,
    ReviewDecision,
    EnrolmentStatus,
    ConfirmationStatus,
    BatchState,
)

try:
    from backend.app.models.student import Student
    from backend.app.models.enrolment import Enrolment
    from backend.app.models.institution import Institution, SeatConfig
    from backend.app.models.batch import SubmissionBatch
    from backend.app.models.validation_issue import ValidationIssue
    from backend.app.models.review_case import ReviewCase
    from backend.app.models.risk_score import RiskScore
    from backend.app.models.audit_log import AuditRecord
except Exception as exc:
    import warnings
    warnings.warn(f"[models/__init__] Could not import ORM models: {exc}")
    Student = None
    Enrolment = None
    Institution = None
    SeatConfig = None
    SubmissionBatch = None
    ValidationIssue = None
    ReviewCase = None
    RiskScore = None
    AuditRecord = None

__all__ = [
    # Enums
    "IssueSeverity", "IssueState",
    "ReviewCaseType", "ReviewDecision",
    "EnrolmentStatus", "ConfirmationStatus",
    "BatchState",
    # ORM Models
    "Student", "Enrolment",
    "Institution", "SeatConfig",
    "SubmissionBatch",
    "ValidationIssue",
    "ReviewCase",
    "RiskScore",
    "AuditRecord",
]
