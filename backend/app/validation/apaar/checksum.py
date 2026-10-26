"""
Verhoeff Algorithm for 12-digit APAAR ID Checksum Validation
"""

# The multiplication table
_d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

# The permutation table
_p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

# The inverse table
_inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

def validate_verhoeff(number: str) -> bool:
    """Validate that the given digit string satisfies the Verhoeff checksum."""
    if not number or not number.isdigit():
        return False
    c = 0
    for i, item in enumerate(reversed(number)):
        c = _d[c][_p[i % 8][int(item)]]
    return c == 0

def generate_verhoeff(number: str) -> str:
    """Generate the check digit and return the full number."""
    c = 0
    for i, item in enumerate(reversed(number)):
        c = _d[c][_p[(i + 1) % 8][int(item)]]
    return number + str(_inv[c])

def is_valid_apaar_format(apaar_id: str) -> bool:
    """
    APAAR ID is a 12-digit national academic ID.
    Validates length, numeric integrity, and checksum.
    """
    if not apaar_id:
        return False
    clean_id = str(apaar_id).strip().replace("-", "").replace(" ", "")
    if len(clean_id) != 12 or not clean_id.isdigit():
        return False
    # Validate checksum
    return validate_verhoeff(clean_id)
