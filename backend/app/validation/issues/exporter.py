import io
import csv
from typing import List, Dict, Any, Union

from backend.app.validation.base import ValidationIssueResult
from backend.app.schemas.validation import ValidationIssueSchema


class FailedRowsExporter:
    """
    Exports only the rows that triggered issues, with a new
    'validation_errors' column appended.  Works with both the raw
    ValidationIssueResult objects (from the engine) and the
    ValidationIssueSchema objects (from the API report), because both
    now carry row_index.
    """

    def export_csv(
        self,
        batch_data: List[Dict[str, Any]],
        issues: List[Union[ValidationIssueResult, ValidationIssueSchema]],
    ) -> str:
        # Build row_index → [error strings] map
        issue_map: Dict[int, List[str]] = {}
        for issue in issues:
            idx = getattr(issue, "row_index", None)
            if idx is not None:
                issue_map.setdefault(idx, []).append(
                    f"[{issue.severity.value}] {issue.rule_id}: {issue.message}"
                )

        output = io.StringIO()
        if not batch_data:
            return ""

        fieldnames = list(batch_data[0].keys()) + ["row_number", "validation_errors"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for idx, row in enumerate(batch_data):
            if idx in issue_map:
                row_copy = dict(row)
                row_copy["row_number"] = idx + 1
                row_copy["validation_errors"] = " | ".join(issue_map[idx])
                writer.writerow(row_copy)

        return output.getvalue()
