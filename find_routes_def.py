with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Look for path: "/aicte"
pos = code.find('path:"/aicte"')
print("Pos:", pos)
if pos != -1:
    print(code[pos-200:pos+1500])

