with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

# Let's find function declarations or const components
import re

# Find router routes
routes = re.findall(r'path:\s*\"([^\"]+)\"', code)
print("Routes:", routes)

# Find function names or components
funcs = re.findall(r'function\s+([A-Za-z0-9_$]+)\s*\(', code)
print(f"Functions found ({len(funcs)}):", funcs[:30])

# Look for component definitions like const X = ... or function X
# Also look for state variables and mock data

