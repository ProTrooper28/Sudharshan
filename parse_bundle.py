with open('sudharshan_bundle.js', 'r', encoding='utf-8') as f:
    bundle = f.read()

import re

# Find all occurrences of mock data or student objects or institution objects
# Let's search for objects with APAAR or student names or institutions
print("Lines count:", len(bundle.splitlines()))

# Let's search for JSON-like structures or mock data
records = re.findall(r'\{[^{}]*(?:apaar|student|institution|status)[^{}]*\}', bundle, re.IGNORECASE)
print(f"Candidate records: {len(records)}")
for r in records[:20]:
    print("REC:", r[:120])

