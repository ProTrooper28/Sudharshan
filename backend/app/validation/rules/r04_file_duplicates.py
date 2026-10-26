from typing import List, Dict, Any
from collections import defaultdict
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity

class RuleFileDuplicates(BaseRule):
    rule_id = "R04"
    name = "Duplicate Within File"
    default_severity = IssueSeverity.BLOCK
    description = "Checks if the same APAAR ID + programme + academic year appears more than once in the uploaded batch."

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        issues = []
        seen = defaultdict(list)
        
        for idx, row in enumerate(batch_data):
            apaar = str(row.get("apaar_id", "")).strip()
            prog = str(row.get("programme", "")).strip().lower()
            year = str(row.get("academic_year", "")).strip()
            
            if apaar and apaar not in ("nan", "none", "null"):
                key = (apaar, prog, year)
                seen[key].append(idx)

        for key, indices in seen.items():
            if len(indices) > 1:
                apaar, prog, year = key
                for idx in indices:
                    issues.append(
                        ValidationIssueResult(
                            rule_id=self.rule_id,
                            severity=self.default_severity,
                            message=f"Row {idx + 1}: Duplicate record in file. APAAR '{apaar}' appears {len(indices)} times for {prog} ({year}).",
                            row_index=idx,
                            enrolment_id=str(batch_data[idx].get("enrolment_id") or f"row-{idx+1}"),
                            field_name="apaar_id",
                            raw_value=apaar
                        )
                    )
        return issues
