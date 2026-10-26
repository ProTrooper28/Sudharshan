from typing import List, Dict, Any, Set
from collections import defaultdict

class DuplicateDetector:
    """
    Subsystem for indexing and finding exact and duplicate student enrolments.
    """
    def find_in_file_duplicates(self, rows: List[Dict[str, Any]]) -> Dict[str, List[int]]:
        seen = defaultdict(list)
        for idx, row in enumerate(rows):
            apaar = str(row.get("apaar_id", "")).strip()
            if apaar and apaar.lower() not in ("nan", "none", "null"):
                seen[apaar].append(idx)
        return {apaar: indices for apaar, indices in seen.items() if len(indices) > 1}

    def check_database_duplicates(self, apaar_ids: List[str], inst_id: str, academic_year: str, existing_set: Set[str]) -> List[str]:
        return [apaar for apaar in apaar_ids if (apaar, inst_id, academic_year) in existing_set]
