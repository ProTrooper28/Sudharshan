from typing import Dict, Any, Tuple

class SeatLedger:
    """
    Live seat ledger tracking approved vs actual admissions.
    Surfaces 90% and 100% threshold states.
    """
    def check_intake_pressure(self, approved: int, enrolled: int) -> Tuple[float, str]:
        if approved <= 0:
            return 1.0, "OVER_INTAKE"
        ratio = enrolled / approved
        if ratio > 1.0:
            status = "OVER_INTAKE"
        elif ratio >= 1.0:
            status = "AT_CAPACITY"
        elif ratio >= 0.90:
            status = "WARNING_90_PERCENT"
        else:
            status = "HEALTHY"
        return round(ratio, 4), status
