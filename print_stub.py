with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

pos = code.find("QR credentials are not issued")
if pos != -1:
    print(code[pos-500:pos+1500])

