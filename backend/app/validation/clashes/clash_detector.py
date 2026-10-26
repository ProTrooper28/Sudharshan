from typing import Dict, Any, List

class CrossInstitutionClashDetector:
    """
    Subsystem for detecting concurrent full-time enrolments across different institutions.
    """
    def scan_for_clashes(
        self,
        current_inst_id: str,
        apaar_id: str,
        academic_year: str,
        national_enrolment_registry: Dict[str, List[Dict[str, Any]]]
    ) -> List[Dict[str, Any]]:
        clashes = []
        enrolments = national_enrolment_registry.get(apaar_id, [])
        for e in enrolments:
            if e.get("inst_id") != current_inst_id and e.get("academic_year") == academic_year:
                clashes.append(e)
        return clashes
