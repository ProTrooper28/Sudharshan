with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

for fn in ['px', 'yx', 'gx']:
    pos = code.find(f"function {fn}(")
    if pos != -1:
        print(f"=== {fn} ===")
        print(code[pos:pos+1000])

