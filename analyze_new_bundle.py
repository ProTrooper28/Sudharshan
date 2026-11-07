import re

with open("index-BX8_Ypuv.js", "r", encoding="utf-8") as f:
    code = f.read()

print("File size:", len(code))

# Find routes
routes = re.findall(r'path:\s*\"([^\"]+)\"', code)
print("Routes:", sorted(set(routes)))

# Search for keywords
keywords = ['credential', 'qr', 'verification', 'audit', 'tamper', 'hash', 'revoc', 'consent', 'trust', 'sih']
for kw in keywords:
    matches = len(re.findall(kw, code, re.IGNORECASE))
    print(f"Keyword '{kw}': {matches} matches")
