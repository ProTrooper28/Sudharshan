with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Find createBrowserRouter or similar
for m in re.finditer(r'\[\{path:', code):
    pos = m.start()
    print("Found [{path: at pos", pos)
    print(code[pos:pos+1000])

