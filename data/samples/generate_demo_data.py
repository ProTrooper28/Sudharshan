"""
Generates the Sudarshan demo dataset (Python standard library + the project's own code).

Run from the project root:
    python backend/data/generate_demo_data.py

Creates in data/samples/:
    student_upload_template.csv   header only - give this to teammates (the agreed format)
    demo_students.csv             ~110 students, mostly clean, with PLANTED errors
    demo_context.json             the "database state" the rules need (seat limits, clashes, ...)
    planted_errors_key.csv        answer key: which row has which planted error

Then it runs the validation engine on the data and checks every planted error is caught.
Same output on every run (fixed seed).
"""
import csv
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from backend.app.adapters.mock_apaar import MockApaarProvider      # noqa: E402
from backend.app.validation.engine import ValidationEngine        # noqa: E402

OUT = ROOT / "data" / "samples"
INST_ID = "INST-PUNE-41"
YEAR = "2026"
CSE, ECE, MECH = "B.Tech Computer Science", "B.Tech Electronics", "B.Tech Mechanical"

# THE FORMAT - one place to change it. Teammates: edit columns here + in the template.
COLUMNS = ["apaar_id", "name", "dob", "gender", "nationality", "parent_name",
           "programme", "academic_year", "quota", "admission_date", "justification_doc"]

FEMALE = {"Priya", "Ananya", "Diya", "Sneha", "Pooja", "Neha", "Kavya", "Riya", "Meera", "Isha"}
MALE_PARENTS = ["Ramesh", "Suresh", "Mahesh", "Vijay", "Anil", "Sunil", "Rajesh", "Deepak", "Manoj", "Ashok"]

# approved seats per programme, and how many are already filled in the database
SEAT_CONFIG = {
    CSE:  {"approved_intake": 60, "nri_limit": 3, "oci_limit": 3, "fn_limit": 3, "supernumerary_limit": 3},
    ECE:  {"approved_intake": 40, "nri_limit": 3, "oci_limit": 3, "fn_limit": 3, "supernumerary_limit": 3},
    MECH: {"approved_intake": 30, "nri_limit": 3, "oci_limit": 3, "fn_limit": 3, "supernumerary_limit": 3},
}
ALREADY_ENROLLED = {CSE: 0, ECE: 0, MECH: 24}   # MECH is almost full -> over-intake demo


def main():
    rng = random.Random(7)
    provider = MockApaarProvider()
    reg = provider.registry
    pool = [i for i in provider.active_ids() if i not in {
        "123456789012", "987654321098", "555566667777", "111122223333", "444455556666"}]
    rng.shuffle(pool)
    pool_iter = iter(pool)
    used_names = set()

    def person(apaar=None):
        apaar = apaar or next(pool_iter)
        rec = reg[apaar]
        first, last = rec["name"].split()
        return apaar, rec, first, last

    def make_row(programme, quota="regular", nationality="Indian", justification="", apaar=None, tags=None):
        apaar, rec, first, last = person(apaar)
        row = {
            "apaar_id": apaar, "name": rec["name"], "dob": rec["dob"],
            "gender": "Female" if first in FEMALE else "Male",
            "nationality": nationality,
            "parent_name": f"{rng.choice(MALE_PARENTS)} {last}",
            "programme": programme, "academic_year": YEAR, "quota": quota,
            "admission_date": f"2026-07-{rng.randint(1, 28):02d}",
            "justification_doc": justification,
        }
        row["_tags"] = list(tags or [])
        return row

    ctx = {"seat_configs": {}, "current_enrolment_counts": {}, "external_active_enrolments": {},
           "existing_students": [], "existing_institution_enrolments": []}
    for prog, cfg in SEAT_CONFIG.items():
        ctx["seat_configs"][f"{prog}|{YEAR}"] = cfg
        ctx["current_enrolment_counts"][f"{prog}|{YEAR}"] = ALREADY_ENROLLED[prog]

    # ---------- CLEAN students ----------
    cse, ece, mech = [], [], []
    for _ in range(40):
        cse.append(make_row(CSE, quota=rng.choice(["regular", "state", "management"])))
    for n in range(1, 4):
        cse.append(make_row(CSE, quota="nri", nationality="NRI", justification=f"DOC-NRI-{n:04d}"))
    for _ in range(28):
        ece.append(make_row(ECE, quota=rng.choice(["regular", "state", "management"])))
    ece.append(make_row(ECE, quota="fn", nationality="Foreign National", justification="DOC-FN-0001"))
    ece.append(make_row(ECE, quota="oci", nationality="OCI", justification="DOC-OCI-0001"))

    # ---------- MECH: over-intake (24 already enrolled + 8 new, intake 30) ----------
    for k in range(1, 9):
        total = ALREADY_ENROLLED[MECH] + k
        tags = []
        if total > SEAT_CONFIG[MECH]["approved_intake"]:
            tags.append(("R07", "CRITICAL", "Over-intake: admissions exceed approved intake"))
        elif total >= int(0.9 * SEAT_CONFIG[MECH]["approved_intake"]):
            tags.append(("R07", "WARN", "Intake 90% alert"))
        mech.append(make_row(MECH, tags=tags))

    # ---------- PLANTED errors (all in CSE, inserted at random positions) ----------
    planted = []

    r = make_row(CSE, tags=[("R01", "BLOCK", "Missing APAAR ID")]); r["apaar_id"] = ""; planted.append(r)
    r = make_row(CSE, tags=[("R02", "BLOCK", "APAAR ID too short (9 digits)")]); r["apaar_id"] = "987654321"; planted.append(r)
    r = make_row(CSE, tags=[("R02", "BLOCK", "APAAR ID contains letters")]); r["apaar_id"] = "12345ABC9012"; planted.append(r)
    r = make_row(CSE, tags=[("R03", "BLOCK", "APAAR ID well-formed but never issued (not in registry)")])
    r["apaar_id"] = "700000000001"; assert "700000000001" not in reg; planted.append(r)
    r = make_row(CSE, apaar="999988887777", tags=[("R03", "BLOCK", "APAAR ID deactivated")]); planted.append(r)

    # R04: same student uploaded twice
    original = cse[5]
    dup = dict(original); dup["admission_date"] = "2026-07-30"; dup["_tags"] = [("R04", "BLOCK", "Duplicate row in file")]
    original["_tags"].append(("R04", "BLOCK", "Duplicate row in file (first copy)"))
    planted.append(dup)

    # R05: already enrolled in this institution
    r = make_row(CSE, tags=[("R05", "ERROR", "Already enrolled at this institution for 2026")])
    ctx["existing_institution_enrolments"].append([r["apaar_id"], YEAR]); planted.append(r)

    # R06: active at another college
    r = make_row(CSE, tags=[("R06", "CRITICAL", "Dual enrolment: already active at VJTI_MUMBAI")])
    ctx["external_active_enrolments"][r["apaar_id"]] = [
        {"inst_id": "VJTI_MUMBAI", "programme": "B.Tech IT", "academic_year": YEAR}]
    planted.append(r)

    # R08: NRI over limit (limit 3, 3 clean already) and NRI without justification
    planted.append(make_row(CSE, quota="nri", nationality="NRI", justification="DOC-NRI-0004"))
    r = make_row(ECE, quota="nri", nationality="NRI", justification="",
                 tags=[("R08", "ERROR", "NRI admission without justification document")]); ece.append(r)

    # R09: implausible / badly formatted fields
    r = make_row(CSE, tags=[("R09", "WARN", "Implausible age (DOB 2018)")]); r["dob"] = "2018-03-09"; planted.append(r)
    r = make_row(CSE, tags=[("R09", "ERROR", "DOB not in YYYY-MM-DD format")]); r["dob"] = "12/05/2004"; planted.append(r)
    r = make_row(CSE, tags=[("R09", "WARN", "Admission date (2022) far from academic year 2026")]); r["admission_date"] = "2022-07-10"; planted.append(r)

    # R10: same person, different APAAR ID, slightly different name/parent
    existing_apaar, ex_rec, ex_first, ex_last = person()
    ex_parent = f"Sureshkumar {ex_last}"
    ctx["existing_students"].append({"apaar_id": existing_apaar, "name": ex_rec["name"],
                                     "dob": ex_rec["dob"], "parent_name": ex_parent})
    r = make_row(CSE, tags=[("R10", "WARN", "Fuzzy duplicate of an existing student under another APAAR ID")])
    r["name"] = f"{ex_first} K. {ex_last}"; r["dob"] = ex_rec["dob"]; r["parent_name"] = f"Suresh {ex_last}"
    planted.append(r)

    for p in planted:                       # scatter planted rows among the clean CSE rows
        cse.insert(rng.randint(0, len(cse)), p)

    # the engine counts NRI seats in file order, so the 4th NRI row (whichever it is) is the one flagged
    [r for r in cse if r["quota"] == "nri"][3]["_tags"].append(("R08", "ERROR", "NRI quota limit (3) breached"))

    rows = cse + ece + mech

    # ---------- write files ----------
    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / "student_upload_template.csv", "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(COLUMNS)
    with open(OUT / "demo_students.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore"); w.writeheader(); w.writerows(rows)
    with open(OUT / "planted_errors_demo.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore"); w.writeheader(); w.writerows(rows)
    with open(OUT / "demo_context.json", "w", encoding="utf-8") as f:
        json.dump(ctx, f, indent=2)
    key = [(i + 1, rid, sev, why, r["apaar_id"], r["name"])
           for i, r in enumerate(rows) for (rid, sev, why) in r["_tags"]]
    with open(OUT / "planted_errors_key.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["row", "expected_rule", "severity", "why", "apaar_id", "name"]); w.writerows(key)

    print(f"Wrote {len(rows)} students, {len(key)} planted/expected issues -> {OUT}")
    check(rows, key)


def load_context(path):
    """demo_context.json -> the dict shape the validation engine expects."""
    raw = json.load(open(path, encoding="utf-8"))
    sc = lambda d: {tuple(k.split("|")): v for k, v in d.items()}
    return {
        "seat_configs": sc(raw["seat_configs"]),
        "current_enrolment_counts": sc(raw["current_enrolment_counts"]),
        "external_active_enrolments": raw["external_active_enrolments"],
        "existing_students": raw["existing_students"],
        "existing_institution_enrolments": {tuple(x) for x in raw["existing_institution_enrolments"]},
    }


def check(rows, key):
    data = list(csv.DictReader(open(OUT / "demo_students.csv", encoding="utf-8")))
    ctx = load_context(OUT / "demo_context.json")
    report = ValidationEngine().validate_batch("DEMO-BATCH", INST_ID, data, ctx)
    found = {(int(i.enrolment_id.split('-')[-1]), i.rule_id) for i in report.issues}  # enrolment_id is 'row-N'
    expected = {(row, rid) for row, rid, *_ in key}
    missed, extra = expected - found, found - expected
    print(f"Engine reported {len(report.issues)} issues "
          f"(BLOCK {report.summary.block_count}, CRITICAL {report.summary.critical_count}, "
          f"ERROR {report.summary.error_count}, WARN {report.summary.warn_count})")
    print(f"Planted errors caught: {len(expected) - len(missed)}/{len(expected)}")
    if missed: print("  MISSED :", sorted(missed))
    if extra:  print("  UNEXPECTED issues (not in answer key):", sorted(extra))
    if not missed and not extra: print("  Every planted error caught, nothing unexpected. Dataset is consistent.")


if __name__ == "__main__":
    main()