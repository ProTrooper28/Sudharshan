from typing import List, Dict, Any
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RuleInstitutionDuplicates(BaseRule):
    rule_id = "R05"
    name = "Duplicate Within Institution"
    default_severity = IssueSeverity.ERROR
    description = "Checks if APAAR already has an active enrolment in the database for the same institution and academic year."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        raw_enrolments = context.get("existing_institution_enrolments", set()) or set()
        # existing_institution_enrolments is a set of (apaar_id, academic_year) already active in DB
        existing_enrolments = {
            tuple(x) if isinstance(x, (list, tuple)) else x
            for x in raw_enrolments
        }

        for idx, row in enumerate(batch_data):
            apaar = str(row.get("apaar_id", "")).strip()
            year = str(row.get("academic_year", "")).strip()

            if (apaar, year) in existing_enrolments:
                issues.append(
                    ValidationIssueResult(
                        rule_id=self.rule_id,
                        severity=self.default_severity,
                        message=f"Row {idx + 1}: Student with APAAR '{apaar}' already has an active enrolment in this institution for academic year {year}.",
                        row_index=idx,
                        enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                        field_name="apaar_id",
                        raw_value=apaar
                    )
                )
        return issues
