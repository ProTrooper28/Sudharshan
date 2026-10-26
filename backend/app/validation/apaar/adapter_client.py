from typing import Optional, Dict, Any
from backend.app.adapters.mock_apaar import MockApaarProvider

class ApaarValidationClient:
    """
    Adapter client interface to connect with external APAAR / ABC / DigiLocker service.
    Uses MockApaarProvider for hackathon demo.
    """
    def __init__(self, provider: Optional[Any] = None):
        self.provider = provider or MockApaarProvider()

    def check_status(self, apaar_id: str) -> Dict[str, Any]:
        """
        Returns { "exists": bool, "active": bool, "name": str, "dob": str }
        """
        return self.provider.lookup_apaar(apaar_id)
