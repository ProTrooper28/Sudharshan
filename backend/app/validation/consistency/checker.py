from typing import Dict, Any, List

class ConsistencyChecker:
    """
    Subsystem for comprehensive student data integrity checks.
    """
    @staticmethod
    def validate_quota_justification(quota: str, doc_ref: str) -> bool:
        if quota.lower() in ("nri", "supernumerary", "oci", "fn"):
            return bool(doc_ref and str(doc_ref).strip())
        return True
