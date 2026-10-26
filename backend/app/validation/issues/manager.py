from typing import List
from backend.app.validation.base import ValidationIssueResult
from backend.app.schemas.validation import ValidationSummary, ValidationIssueSchema
from backend.app.models.enums import IssueSeverity, IssueState


class ValidationIssueManager:
    """
    Categorises, deduplicates and summarises validation issues.
    """

    def summarize(
        self, batch_id: str, issues: List[ValidationIssueResult], total_rows: int
    ) -> ValidationSummary:
        block_count    = sum(1 for i in issues if i.severity == IssueSeverity.BLOCK)
        critical_count = sum(1 for i in issues if i.severity == IssueSeverity.CRITICAL)
        error_count    = sum(1 for i in issues if i.severity == IssueSeverity.ERROR)
        warn_count     = sum(1 for i in issues if i.severity == IssueSeverity.WARN)
        flag_count     = sum(1 for i in issues if i.severity == IssueSeverity.FLAG)

        failed_rows = len(
            set(
                i.row_index
                for i in issues
                if i.row_index is not None
                and i.severity in (IssueSeverity.BLOCK, IssueSeverity.CRITICAL, IssueSeverity.ERROR)
            )
        )
        valid_rows = max(0, total_rows - failed_rows)
        can_proceed = block_count == 0 and critical_count == 0

        return ValidationSummary(
            total_rows=total_rows,
            valid_rows=valid_rows,
            failed_rows=failed_rows,
            block_count=block_count,
            critical_count=critical_count,
            error_count=error_count,
            warn_count=warn_count,
            flag_count=flag_count,
            can_proceed=can_proceed,
        )

    def to_schemas(
        self, batch_id: str, results: List[ValidationIssueResult]
    ) -> List[ValidationIssueSchema]:
        return [
            ValidationIssueSchema(
                batch_id=batch_id,
                enrolment_id=r.enrolment_id,
                row_index=r.row_index,        # ← pass through so exporter can use it
                rule_id=r.rule_id,
                severity=r.severity,
                message=r.message,
                field_name=r.field_name,
                raw_value=r.raw_value,
                state=IssueState.OPEN,
            )
            for r in results
        ]
