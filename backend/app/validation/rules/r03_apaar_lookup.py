from typing import List, Dict, Any
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity
from backend.app.validation.apaar.adapter_client import ApaarValidationClient

class RuleApaarLookup(BaseRule):
    rule_id = "R03"
    name = "APAAR Not Found or Inactive"
    default_severity = IssueSeverity.BLOCK
    description = "Checks status against external ApaarProvider registry to verify active status."

    def __init__(self, client: ApaarValidationClient = None):
        self.client = client or ApaarValidationClient()

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        for idx, row in enumerate(batch_data):
            apaar = row.get("apaar_id")
            if apaar and str(apaar).strip():
                clean_apaar = str(apaar).strip().replace("-", "").replace(" ", "")
                if len(clean_apaar) == 12 and clean_apaar.isdigit():
                    status = self.client.check_status(clean_apaar)
                    if not status.get("exists", False):
                        issues.append(
                            ValidationIssueResult(
                                rule_id=self.rule_id,
                                severity=self.default_severity,
                                message=f"Row {idx + 1}: APAAR ID '{apaar}' was not found in the national APAAR/ABC registry.",
                                row_index=idx,
                                enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                                field_name="apaar_id",
                                raw_value=str(apaar)
                            )
                        )
                    elif not status.get("active", True):
                        issues.append(
                            ValidationIssueResult(
                                rule_id=self.rule_id,
                                severity=self.default_severity,
                                message=f"Row {idx + 1}: APAAR ID '{apaar}' is suspended or deactivated in the registry.",
                                row_index=idx,
                                enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                                field_name="apaar_id",
                                raw_value=str(apaar)
                            )
                        )
        return issues
