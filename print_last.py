with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

print("Last 5000 characters:")
print(code[-5000:])

