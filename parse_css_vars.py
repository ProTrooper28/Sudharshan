with open("sudharshan.css", "r", encoding="utf-8") as f:
    css = f.read()

import re
root_vars = re.findall(r'--[a-zA-Z0-9_\-]+:\s*[^;]+;', css)
print(f"CSS variables ({len(root_vars)}):")
for v in root_vars[:40]:
    print(" ", v)

