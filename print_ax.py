with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find("QR credentials are not issued")
if pos != -1:
    print(code[pos-2500:pos])

