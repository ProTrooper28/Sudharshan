"""
fuzzy.py  -  Rule R10: fuzzy duplicate detection (APAAR-aware)

Question answered: "are these two records the same real person?"
Used when the APAAR ID is missing, mistyped, or DIFFERENT, so the exact-ID
rules (R04/R05) cannot catch the duplicate.

Signals used (all compared after cleaning):
  * Name        token-sort ratio + Jaro-Winkler, averaged (0-100)
  * DOB         parsed into a real date: exact / near (day-month swap or
                one-digit typo) / different / unknown
  * Parent name same cleaning and score as the name
  * APAAR ID    same / typo (<=2 edits) / different / unknown

How the APAAR ID is used
  * same ID + same person      -> DUPLICATE (also caught by R04/R05)
  * same ID + different person -> ID_CONFLICT (one ID, two people: serious)
  * ID differs by 1-2 digits   -> supports a match (probably a typo)
  * IDs completely different   -> neutral. That is exactly the case this
    file exists for (same person registered under two IDs), so a different
    ID must never lower the score.
  * ID missing on a side       -> neutral

Matches are never auto-merged. They go to the review queue with reasons.

Requires: rapidfuzz (listed in requirements.txt).
"""
from __future__ import annotations

import re
import unicodedata
from datetime import date, datetime
from typing import Any

from rapidfuzz import fuzz
from rapidfuzz.distance import JaroWinkler, Levenshtein

# --------------------------------------------------------------------------
# Cleaning helpers
# --------------------------------------------------------------------------
_TITLES = {"mr", "mrs", "ms", "miss", "dr", "shri", "smt", "sri", "kumari", "late", "prof"}

_DOB_FORMATS = (
    "%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
    "%d %b %Y", "%d %B %Y", "%d/%m/%y", "%d-%m-%y",
)


def clean_name(value: Any) -> str:
    """Lowercase, drop accents/punctuation/titles, collapse spaces, sort words."""
    if value is None:
        return ""
    text = unicodedata.normalize("NFKD", str(value))
    text = "".join(c for c in text if not unicodedata.combining(c)).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    tokens = [t for t in text.split() if t not in _TITLES]
    return " ".join(sorted(tokens))


def clean_apaar(value: Any) -> str:
    """Keep only digits (removes spaces and dashes)."""
    if value is None:
        return ""
    return re.sub(r"\D", "", str(value))


def parse_dob(value: Any) -> date | None:
    """Parse many DOB formats into a date. Slash formats are read day-first (India)."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none", "nat"}:
        return None
    text = text.split(" ")[0] if re.match(r"^\d{4}-\d{2}-\d{2} ", text) else text
    for fmt in _DOB_FORMATS:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def _swap_day_month(d: date) -> date | None:
    if d.day <= 12:
        try:
            return date(d.year, d.day, d.month)
        except ValueError:
            return None
    return None


def dob_relation(d1: date | None, d2: date | None) -> str:
    """'exact' | 'near' | 'different' | 'unknown'."""
    if d1 is None or d2 is None:
        return "unknown"
    if d1 == d2:
        return "exact"
    if _swap_day_month(d1) == d2 or _swap_day_month(d2) == d1:
        return "near"
    if Levenshtein.distance(d1.isoformat(), d2.isoformat()) == 1:
        return "near"
    return "different"


def apaar_relation(a1: str, a2: str) -> tuple[str, int | None]:
    """('same'|'typo'|'different'|'unknown', edit distance)."""
    if not a1 or not a2:
        return "unknown", None
    if a1 == a2:
        return "same", 0
    dist = Levenshtein.distance(a1, a2)
    if dist <= 2 and len(a1) == len(a2) == 12:
        return "typo", dist
    return "different", dist


def text_similarity(c1: str, c2: str) -> float:
    """0-100 similarity of two ALREADY-CLEANED strings."""
    if not c1 or not c2:
        return 0.0
    return (fuzz.ratio(c1, c2) + JaroWinkler.normalized_similarity(c1, c2) * 100.0) / 2.0


# --------------------------------------------------------------------------
# The matcher
# --------------------------------------------------------------------------
class FuzzyDuplicateMatcher:
    """
    Parameters
    ----------
    name_threshold   : name similarity that counts as a strong match (default 85)
    parent_threshold : parent similarity that counts as a strong match (default 80)
    name_floor       : minimum name similarity when other evidence is strong (default 75)

    Tune these on your synthetic data and write the scores in your slides.
    """

    # weights for the reported composite score (re-normalised over known signals)
    W_NAME, W_DOB, W_PARENT, W_APAAR = 0.40, 0.30, 0.15, 0.15

    def __init__(
        self,
        name_threshold: float = 85.0,
        parent_threshold: float = 80.0,
        name_floor: float = 75.0,
    ):
        self.name_threshold = name_threshold
        self.parent_threshold = parent_threshold
        self.name_floor = name_floor

    # ---------------- pair comparison ----------------
    def compute_match_score(
        self,
        name1: str, dob1: Any, parent1: str,
        name2: str, dob2: Any, parent2: str,
        apaar_id1: Any = None, apaar_id2: Any = None,
    ) -> tuple[bool, float, dict[str, Any]]:
        """
        Compare two student records.
        Returns (is_match, composite_score_0_to_100, details).
        The first six arguments are unchanged from the old version, so existing
        callers keep working; the APAAR IDs are optional extra arguments.
        details["verdict"] is one of: DUPLICATE, POSSIBLE_DUPLICATE,
        ID_CONFLICT, NO_MATCH.
        """
        n1, n2 = clean_name(name1), clean_name(name2)
        p1, p2 = clean_name(parent1), clean_name(parent2)
        a1, a2 = clean_apaar(apaar_id1), clean_apaar(apaar_id2)

        name_sim = text_similarity(n1, n2)
        parent_known = bool(p1 and p2)
        parent_sim = text_similarity(p1, p2) if parent_known else None
        dob_rel = dob_relation(parse_dob(dob1), parse_dob(dob2))
        apaar_rel, apaar_dist = apaar_relation(a1, a2)

        name_strong = name_sim >= self.name_threshold
        name_ok = name_sim >= self.name_floor
        parent_strong = parent_known and parent_sim >= self.parent_threshold
        dob_ok = dob_rel in ("exact", "near")

        verdict = "NO_MATCH"
        confidence = None
        reasons: list[str] = []

        if apaar_rel == "same":
            if dob_rel == "exact" and name_ok:
                verdict, confidence = "DUPLICATE", "high"
                reasons.append("same APAAR ID, same DOB and similar name")
            elif dob_rel in ("different", "unknown") or not name_ok:
                verdict = "ID_CONFLICT"
                reasons.append("same APAAR ID but the person details differ")
        elif dob_rel == "exact":
            if apaar_rel == "typo" and name_ok:
                verdict, confidence = "DUPLICATE", "high"
            elif name_strong and parent_strong:
                verdict, confidence = "DUPLICATE", "high"
            elif name_strong and not parent_known:
                verdict, confidence = "POSSIBLE_DUPLICATE", "medium"
            elif name_ok and parent_strong:
                verdict, confidence = "POSSIBLE_DUPLICATE", "medium"
        elif dob_rel == "near":
            if name_strong and parent_strong:
                verdict, confidence = "POSSIBLE_DUPLICATE", "medium"
            elif apaar_rel == "typo" and name_strong:
                verdict, confidence = "POSSIBLE_DUPLICATE", "medium"

        # ---- reasons text for the review queue ----
        if verdict in ("DUPLICATE", "POSSIBLE_DUPLICATE"):
            reasons.append(f"DOB {dob_rel}")
            reasons.append(f"name {name_sim:.0f}% similar")
            if parent_known:
                reasons.append(f"parent name {parent_sim:.0f}% similar")
            else:
                reasons.append("parent name not available to confirm")
            if apaar_rel == "typo":
                reasons.append(f"APAAR IDs differ by {apaar_dist} digit(s), likely a typo")
            elif apaar_rel == "different":
                reasons.append("APAAR IDs are different (same person under two IDs?)")
            elif apaar_rel == "unknown":
                reasons.append("APAAR ID missing on at least one record")

        # ---- composite score (only over signals we actually know) ----
        parts: list[tuple[float, float]] = [(self.W_NAME, name_sim)]
        if dob_rel != "unknown":
            parts.append((self.W_DOB, {"exact": 100.0, "near": 60.0, "different": 0.0}[dob_rel]))
        if parent_known:
            parts.append((self.W_PARENT, parent_sim))
        if apaar_rel == "same":
            parts.append((self.W_APAAR, 100.0))
        elif apaar_rel == "typo":
            parts.append((self.W_APAAR, 80.0 if apaar_dist == 1 else 60.0))
        total_w = sum(w for w, _ in parts)
        composite = sum(w * s for w, s in parts) / total_w

        is_match = verdict in ("DUPLICATE", "POSSIBLE_DUPLICATE")
        details = {
            "verdict": verdict,
            "confidence": confidence,
            "name_similarity": round(name_sim, 2),
            "parent_similarity": None if parent_sim is None else round(parent_sim, 2),
            "dob_relation": dob_rel,
            "dob_match": dob_rel == "exact",  # kept for old callers
            "apaar_relation": apaar_rel,
            "apaar_edit_distance": apaar_dist,
            "composite_score": round(composite, 2),
            "reasons": reasons,
            "reason_text": "; ".join(reasons),
        }
        return is_match, round(composite, 2), details

    # ---------------- whole-batch scan ----------------
    def find_duplicates(
        self,
        records: Any,
        existing: Any = None,
        include_same_id: bool = True,
    ) -> list[dict[str, Any]]:
        """
        Scan a whole upload for fuzzy duplicates.

        records  : list of dicts (or a pandas DataFrame) with the keys
                   apaar_id, name, dob, parent_name  (extra keys are ignored)
        existing : optional list/DataFrame of records already in the database.
                   When given, every uploaded row is compared with them too.
        include_same_id : also report pairs that share an APAAR ID. Set False
                   if R04/R05 already report those and you want no overlap.

        Returns a list of findings, best score first. Each finding has:
        source_a, index_a, source_b, index_b ("batch" or "existing"),
        apaar_id_a/b, name_a/b, verdict, confidence, score, reason_text, details.
        Only matches and ID conflicts are returned.

        Speed: rows are only compared when they share a DOB (or its
        day-month swap) or share a 4-digit chunk of the APAAR ID, so a batch
        of thousands takes a moment, not minutes.
        """
        batch = _as_rows(records)
        db = _as_rows(existing) if existing is not None else []
        combined = [("existing", i, r) for i, r in enumerate(db)] + \
                   [("batch", i, r) for i, r in enumerate(batch)]

        prepared = []
        for src, idx, row in combined:
            d = parse_dob(_get(row, "dob", "date_of_birth"))
            prepared.append({
                "src": src, "idx": idx, "row": row,
                "apaar": clean_apaar(_get(row, "apaar_id", "apaar")),
                "dob": d,
            })

        # ---- blocking: build candidate pairs cheaply ----
        blocks: dict[tuple, list[int]] = {}
        for k, p in enumerate(prepared):
            keys = []
            if p["dob"]:
                keys.append(("dob", p["dob"]))
                sw = _swap_day_month(p["dob"])
                if sw:
                    keys.append(("dob", sw))
            a = p["apaar"]
            if len(a) == 12:
                keys.append(("id", a))
                for c in range(3):  # a typo of <=2 digits leaves one chunk intact
                    keys.append(("chunk", c, a[c * 4:(c + 1) * 4]))
            for key in keys:
                blocks.setdefault(key, []).append(k)

        pairs: set[tuple[int, int]] = set()
        for members in blocks.values():
            for x in range(len(members)):
                for y in range(x + 1, len(members)):
                    i, j = members[x], members[y]
                    if prepared[i]["src"] == "existing" and prepared[j]["src"] == "existing":
                        continue  # never re-check the database against itself
                    pairs.add((i, j))

        findings = []
        for i, j in pairs:
            a, b = prepared[i], prepared[j]
            ra, rb = a["row"], b["row"]
            is_match, score, det = self.compute_match_score(
                _get(ra, "name", "student_name"), _get(ra, "dob", "date_of_birth"), _get(ra, "parent_name", "parent"),
                _get(rb, "name", "student_name"), _get(rb, "dob", "date_of_birth"), _get(rb, "parent_name", "parent"),
                a["apaar"], b["apaar"],
            )
            if det["verdict"] == "NO_MATCH":
                continue
            if det["verdict"] == "DUPLICATE" and det["apaar_relation"] == "same" and not include_same_id:
                continue
            findings.append({
                "source_a": a["src"], "index_a": a["idx"],
                "source_b": b["src"], "index_b": b["idx"],
                "apaar_id_a": a["apaar"] or None, "apaar_id_b": b["apaar"] or None,
                "name_a": _get(ra, "name", "student_name"), "name_b": _get(rb, "name", "student_name"),
                "verdict": det["verdict"], "confidence": det["confidence"],
                "score": score, "reason_text": det["reason_text"], "details": det,
            })
        findings.sort(key=lambda f: f["score"], reverse=True)
        return findings


# --------------------------------------------------------------------------
# small utilities
# --------------------------------------------------------------------------
def _as_rows(data: Any) -> list[dict[str, Any]]:
    if data is None:
        return []
    if hasattr(data, "to_dict"):  # pandas DataFrame
        return data.to_dict("records")
    return list(data)


def _get(row: Any, *keys: str) -> Any:
    for k in keys:
        if isinstance(row, dict):
            if k in row and row[k] is not None:
                return row[k]
        elif hasattr(row, k):
            return getattr(row, k)
    return None