import enum

class IssueSeverity(str, enum.Enum):
    BLOCK = "BLOCK"         # Cannot proceed at all (e.g. missing APAAR, corrupt batch)
    CRITICAL = "CRITICAL"   # Major integrity breach (cross-institution clash, over-intake)
    ERROR = "ERROR"         # Violates rules/caps (category limit breach, duplicate)
    WARN = "WARN"           # Warning / suspicious (fuzzy duplicate candidate, 90% intake alert)
    FLAG = "FLAG"           # Post-submission tamper / modified record

class IssueState(str, enum.Enum):
    OPEN = "open"
    FIXED = "fixed"
    WAIVED = "waived"

class ReviewCaseType(str, enum.Enum):
    DUPLICATE = "duplicate"
    CLASH = "clash"
    ANOMALY = "anomaly"
    DISPUTED = "disputed"

class ReviewDecision(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"

class EnrolmentStatus(str, enum.Enum):
    ADMITTED = "admitted"
    WITHDRAWN = "withdrawn"
    TRANSFERRED = "transferred"
    GRADUATED = "graduated"

class ConfirmationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    DISPUTED = "disputed"

class BatchState(str, enum.Enum):
    DRAFT = "draft"
    VALIDATED = "validated"
    SUBMITTED = "submitted"
    LOCKED = "locked"
