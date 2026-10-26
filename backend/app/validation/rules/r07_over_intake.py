from typing import List, Dict, Any
from collections import defaultdict
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RuleOverIntake(BaseRule):
    rule_id = "R07"
    name = "Over-Intake Capacity Breach"
    default_severity = IssueSeverity.CRITICAL
    description = "Checks if regular admissions exceed approved intake. Triggers 90% warnings and 100%+ critical blocks."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        seat_configs = context.get("seat_configs", {}) or {} # Key: (programme, academic_year) or 'programme|academic_year' -> approved_intake
        current_counts = context.get("current_enrolment_counts", {}) or {} # DB count of regular admissions

        # Count new regular admissions in this batch
        batch_counts = defaultdict(int)
        for idx, row in enumerate(batch_data):
            prog = str(row.get("programme", "")).strip()
            if not prog:
                continue

            quota = str(row.get("quota", "regular")).lower().strip()
            # Special quotas (supernumerary, nri, oci, fn) are counted against their own limits, not regular
            if quota in ("regular", "merit", "management", "state"):
                year = str(row.get("academic_year", "")).strip()
                key = (prog, year)
                str_key = f"{prog}|{year}"
                batch_counts[key] += 1
                
                cfg = seat_configs.get(key) or seat_configs.get(str_key) or {}
                approved_capacity = cfg.get("approved_intake", 100) if isinstance(cfg, dict) else 100
                
                curr_count = current_counts.get(key, 0) if isinstance(current_counts, dict) else 0
                if not curr_count and isinstance(current_counts, dict):
                    curr_count = current_counts.get(str_key, 0) or 0

                total_enrolled = curr_count + batch_counts[key]

                if total_enrolled > approved_capacity:
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=IssueSeverity.CRITICAL,
                            message=(
                                f"Row {idx + 1}: Approved intake capacity ({approved_capacity}) exceeded for "
                                f"{prog} ({year}). Total attempted admissions: {total_enrolled}."
                            ),
                            row_index=idx,
                            enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                            field_name="programme",
                            raw_value=prog
                        )
                    )
                elif total_enrolled >= int(0.9 * approved_capacity):
                    # Warning for 90% threshold alert
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=IssueSeverity.WARN,
                            message=(
                                f"Row {idx + 1}: Programme {prog} ({year}) has reached 90%+ capacity "
                                f"({total_enrolled}/{approved_capacity})."
                            ),
                            row_index=idx,
                            enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                            field_name="programme",
                            raw_value=prog
                        )
                    )
        return issues
