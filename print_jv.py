with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

pos = code.find("function Jv(")
if pos != -1:
    print(code[pos:pos+1500])

