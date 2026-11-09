with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Let's search for mentions of QR, credential, audit, verification, tamper, etc.
keywords = ['credential', 'qr', 'verification', 'audit', 'tamper', 'hash', 'revoc', 'consent']

for kw in keywords:
    print(f"\n==================== KEYWORD: {kw} ====================")
    matches = [m.start() for m in re.finditer(kw, code, re.IGNORECASE)]
    print(f"Total matches: {len(matches)}")
    # Print context for first 3 matches
    for pos in matches[:3]:
        start = max(0, pos - 150)
        end = min(len(code), pos + 250)
        print("--- SNIPPET ---")
        print(code[start:end])

