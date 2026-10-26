from typing import List, Dict, Any
from collections import defaultdict
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RuleCategoryLimits(BaseRule):
    rule_id = "R08"
    name = "Category Limit Breach"
    default_severity = IssueSeverity.ERROR
    description = "Checks if Supernumerary, NRI, OCI, or FN seats exceed configured AICTE quota limits or lack justification."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        seat_configs = context.get("seat_configs", {})
        
        category_batch_counts = defaultdict(int)

        for idx, row in enumerate(batch_data):
            quota = str(row.get("quota", "")).lower().strip()
            prog = str(row.get("programme", "")).strip()
            year = str(row.get("academic_year", "")).strip()
            key = (prog, year)
            str_key = f"{prog}|{year}"

            cfg = seat_configs.get(key) or seat_configs.get(str_key) or {}
            
            if quota in ("nri", "supernumerary", "oci", "fn"):
                category_batch_counts[(key, quota)] += 1
                limit = cfg.get(f"{quota}_limit", 15) if isinstance(cfg, dict) else 15

                # Check justification / document reference
                justification = row.get("justification_doc") or row.get("justification_text")
                if not justification:
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=IssueSeverity.ERROR,
                            message=f"Row {idx + 1}: Admission under '{quota.upper()}' quota requires mandatory justification document reference.",
                            row_index=idx,
                            enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                            field_name="quota",
                            raw_value=quota
                        )
                    )

                if category_batch_counts[(key, quota)] > limit:
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=IssueSeverity.ERROR,
                            message=f"Row {idx + 1}: {quota.upper()} quota limit of {limit} seats breached for {prog} ({year}).",
                            row_index=idx,
                            enrolment_id=str(row.get("enrolment_id") or f"row-{idx+1}"),
                            field_name="quota",
                            raw_value=quota
                        )
                    )
        return issues
