from typing import List, Dict, Any
import hashlib
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RulePostSubmissionEdit(BaseRule):
    rule_id = "R11"
    name = "Post-Submission Tamper Detection"
    default_severity = IssueSeverity.FLAG
    description = "Verifies batch payload hash matches stored submission hash. Flags any post-submission modifications."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        original_hash = context.get("stored_batch_hash")
        batch_state = context.get("batch_state")

        if batch_state in ("submitted", "locked") and original_hash:
            # Recompute canonical payload hash
            payload_str = str(sorted([str(r) for r in batch_data]))
            current_hash = hashlib.sha256(payload_str.encode()).hexdigest()

            if current_hash != original_hash:
                issues.append(
                    ValidationIssueResult(
                        rule_id=self.rule_id,
                        severity=self.default_severity,
                        message="Batch hash mismatch! Record was altered after final submission. Immutability violation flagged in audit chain.",
                        enrolment_id=None,
                        field_name="batch_hash",
                        raw_value=current_hash
                    )
                )
        return issues
