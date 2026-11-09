with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Let's find component names and their definitions
print("Scanning components...")
components = re.findall(r'function\s+([A-Z][a-zA-Z0-9_]*)\s*\(', code)
print(f"PascalCase functions ({len(components)}):", sorted(set(components)))

# Let's inspect each of these components
for comp in sorted(set(components)):
    pos = code.find(f"function {comp}(")
    if pos != -1:
        end = min(len(code), pos + 300)
        snippet = code[pos:end].replace('\n', ' ')
        print(f"[{comp}]: {snippet[:150]}")

