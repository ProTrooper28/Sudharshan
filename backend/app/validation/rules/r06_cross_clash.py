from typing import List, Dict, Any
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RuleCrossInstitutionClash(BaseRule):
    rule_id = "R06"
    name = "Cross-Institution Clash"
    default_severity = IssueSeverity.CRITICAL
    description = "Checks if student's APAAR is concurrently active full-time at another institution during overlapping academic period."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        current_inst_id = context.get("inst_id")
        external_enrolments = context.get("external_active_enrolments", {})
        # external_enrolments format: { apaar_id: [ {"inst_id": "INST_B", "programme": "B.Tech", "academic_year": "2026"} ] }

        for idx, row in enumerate(batch_data):
            apaar = str(row.get("apaar_id", "")).strip()
            year = str(row.get("academic_year", "")).strip()

            if apaar in external_enrolments:
                for clash in external_enrolments[apaar]:
                    clash_year = str(clash.get("academic_year", "")).strip()
                    year_matches = not year or not clash_year or clash_year == year
                    if clash.get("inst_id") != current_inst_id and year_matches:
                        issues.append(
                            ValidationIssueResult(
                                rule_id=self.rule_id,
                                severity=self.default_severity,
                                message=(
                                    f"Row {idx + 1}: Dual enrolment conflict detected! Student '{apaar}' "
                                    f"is already active at institution '{clash.get('inst_id')}' in {clash.get('programme')} for {clash_year or year}. "
                                    f"Case flagged for review queue."
                                ),
                                row_index=idx,
                                enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                                field_name="apaar_id",
                                raw_value=apaar
                            )
                        )
        return issues
