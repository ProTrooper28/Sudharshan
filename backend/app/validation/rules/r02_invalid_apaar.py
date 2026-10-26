from typing import List, Dict, Any
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity
from backend.app.validation.apaar.checksum import is_valid_apaar_format

class RuleInvalidApaarFormat(BaseRule):
    rule_id = "R02"
    name = "Invalid APAAR Format / Checksum"
    default_severity = IssueSeverity.BLOCK
    description = "Checks if APAAR ID adheres to 12-digit format and Verhoeff checksum algorithm."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        for idx, row in enumerate(batch_data):
            apaar = row.get("apaar_id")
            if apaar and str(apaar).strip() and str(apaar).lower() not in ("nan", "none", "null"):
                clean_apaar = str(apaar).strip().replace("-", "").replace(" ", "")
                # Format check: 12 numeric digits
                if len(clean_apaar) != 12 or not clean_apaar.isdigit():
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=self.default_severity,
                            message=f"Row {idx + 1}: APAAR ID '{apaar}' must be exactly 12 numeric digits.",
                            row_index=idx,
                            enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                            field_name="apaar_id",
                            raw_value=str(apaar)
                        )
                    )
        return issues
