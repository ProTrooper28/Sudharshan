"""
Mock APAAR registry (stand-in for the real government service).

Behaves like a REAL registry: only IDs that were "issued" exist.
Anything not in the registry -> exists = False.

Registry = hand-picked DEMO IDs (for predictable demo moments)
         + GENERATED IDs (a few thousand fake students, same every run).

The rest of the app only calls `lookup_apaar()`. To go to production, write a
`RealApaarProvider` with the same method and swap it in
(see validation/apaar/adapter_client.py). Nothing else changes.
"""
import random
from typing import Dict, Any, List

from backend.app.validation.apaar.checksum import generate_verhoeff

NOT_FOUND = {"exists": False, "active": False, "name": "", "dob": ""}

_FIRST = ["Aarav", "Vivaan", "Aditya", "Arjun", "Rohan", "Kabir", "Ishaan", "Sai", "Rahul", "Karan",
          "Priya", "Ananya", "Diya", "Sneha", "Pooja", "Neha", "Kavya", "Riya", "Meera", "Isha"]
_LAST = ["Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Reddy", "Nair", "Iyer", "Khan",
         "Deshmukh", "Joshi", "Mehta", "Rao", "Das", "Bose", "Chopra", "Malhotra", "Yadav", "Mishra"]


def _build_registry(n_generated: int = 3000, inactive_share: float = 0.01, seed: int = 42) -> Dict[str, Dict[str, Any]]:
    reg: Dict[str, Dict[str, Any]] = {}

    # 1) DEMO IDs: fixed, so you know exactly what each one does on stage
    demo = {
        "123456789012": (True,  "Aarav Sharma",        "2004-05-12"),
        "987654321098": (True,  "Priya Patel",         "2003-11-20"),
        "555566667777": (True,  "Rohan Verma",         "2004-01-15"),
        "111122223333": (True,  "Rahul K Sharma",      "2004-05-12"),
        "444455556666": (True,  "Mahesh Rao Student",  "2004-03-14"),
        "999988887777": (False, "Deactivated Student", "2002-08-10"),  # inactive
        "999988886666": (False, "Suspended Student",   "2003-02-14"),  # inactive
        "999988885555": (False, "Cancelled Student",   "2002-09-30"),  # inactive
    }
    for apaar_id, (active, name, dob) in demo.items():
        reg[apaar_id] = {"exists": True, "active": active, "name": name, "dob": dob}

    # 2) GENERATED IDs: fake students, identical on every run (fixed seed)
    rng = random.Random(seed)
    while len(reg) < len(demo) + n_generated:
        body = str(rng.randint(2, 9)) + "".join(str(rng.randint(0, 9)) for _ in range(10))  # 11 digits
        apaar_id = generate_verhoeff(body)                                                   # + check digit = 12
        if apaar_id in reg:
            continue
        reg[apaar_id] = {
            "exists": True,
            "active": rng.random() > inactive_share,
            "name": f"{rng.choice(_FIRST)} {rng.choice(_LAST)}",
            "dob": f"{rng.randint(2001, 2006)}-{rng.randint(1, 12):02d}-{rng.randint(1, 28):02d}",
        }
    return reg


class MockApaarProvider:
    """Implements the ApaarProvider adapter interface."""

    def __init__(self, registry: Dict[str, Dict[str, Any]] = None):
        self.registry = registry if registry is not None else _build_registry()

    def lookup_apaar(self, apaar_id: str) -> Dict[str, Any]:
        """Return {exists, active, name, dob}. Unknown ID -> exists False."""
        clean_id = str(apaar_id).strip().replace("-", "").replace(" ", "")
        record = self.registry.get(clean_id)
        return dict(record) if record else dict(NOT_FOUND)

    # ---- helpers for the test-data generator / demo ----
    def active_ids(self) -> List[str]:
        return [i for i, r in self.registry.items() if r["active"]]

    def inactive_ids(self) -> List[str]:
        return [i for i, r in self.registry.items() if not r["active"]]