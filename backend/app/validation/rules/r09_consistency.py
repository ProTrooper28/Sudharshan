from typing import List, Dict, Any
from datetime import datetime, date
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RuleFieldConsistency(BaseRule):
    rule_id = "R09"
    name = "Field Inconsistency"
    default_severity = IssueSeverity.ERROR
    description = "Validates logical coherence across fields: nationality vs quota, age plausibility, and admission date vs academic year."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        current_year = datetime.now().year

        for idx, row in enumerate(batch_data):
            nationality = str(row.get("nationality", "Indian")).lower().strip()
            quota = str(row.get("quota", "")).lower().strip()
            dob_str = str(row.get("dob", "")).strip()
            adm_date_str = str(row.get("admission_date", "")).strip()
            acad_year = str(row.get("academic_year", "")).strip()

            # 1. Foreign national inconsistency
            if nationality == "foreign national" or quota == "fn":
                if row.get("aadhaar_number") or row.get("caste_category") in ("OBC", "SC", "ST"):
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=IssueSeverity.ERROR,
                            message=f"Row {idx + 1}: Foreign National (FN) applicant cannot have domestic reservation category or domestic Aadhaar tag.",
                            row_index=idx,
                            enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                            field_name="nationality",
                            raw_value=nationality
                        )
                    )

            # 2. Age plausibility check (Undergraduate degree typically requires min 16-17 years old)
            if dob_str:
                try:
                    dob = datetime.strptime(dob_str[:10], "%Y-%m-%d").date()
                    age = current_year - dob.year
                    if age < 15 or age > 65:
                        issues.append(
                            ValidationIssueResult(
                                rule_id=self.rule_id,
                                severity=IssueSeverity.WARN,
                                message=f"Row {idx + 1}: Unlikely student age ({age} years, DOB: {dob_str}) for higher education technical programme.",
                                row_index=idx,
                                enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                                field_name="dob",
                                raw_value=dob_str
                            )
                        )
                except Exception:
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=IssueSeverity.ERROR,
                            message=f"Row {idx + 1}: Invalid date format for DOB '{dob_str}'. Expected YYYY-MM-DD.",
                            row_index=idx,
                            enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                            field_name="dob",
                            raw_value=dob_str
                        )
                    )

            # 3. Admission date plausibility vs academic year
            if adm_date_str and acad_year:
                if acad_year[:4].isdigit() and not adm_date_str.startswith(acad_year[:4]):
                    # If admission year doesn't correlate with academic year
                    try:
                        adm_year = int(adm_date_str[:4])
                        target_year = int(acad_year[:4])
                        if abs(adm_year - target_year) > 1:
                            issues.append(
                                ValidationIssueResult(
                                    rule_id=self.rule_id,
                                    severity=IssueSeverity.WARN,
                                    message=f"Row {idx + 1}: Admission date '{adm_date_str}' deviates significantly from academic session '{acad_year}'.",
                                    row_index=idx,
                                    enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                                    field_name="admission_date",
                                    raw_value=adm_date_str
                                )
                            )
                    except Exception:
                        pass
        return issues
