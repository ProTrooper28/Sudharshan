from typing import List, Dict, Any
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RuleMissingApaar(BaseRule):
    rule_id = "R01"
    name = "Missing APAAR ID"
    default_severity = IssueSeverity.BLOCK
    description = "Checks if APAAR ID is blank or null on any submitted student record."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        for idx, row in enumerate(batch_data):
            apaar = row.get("apaar_id")
            if apaar is None or str(apaar).strip() == "" or str(apaar).lower() in ("nan", "none", "null"):
                issues.append(
                    ValidationIssueResult(
                        rule_id=self.rule_id,
                        severity=self.default_severity,
                        message=f"Row {idx + 1}: APAAR ID is missing or empty. Mandatory for student registration.",
                        row_index=idx,
                        enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                        field_name="apaar_id",
                        raw_value=str(apaar)
                    )
                )
        return issues
