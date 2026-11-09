with open('sudharshan_bundle.js', 'r', encoding='utf-8') as f:
    bundle = f.read()

# Let's search for "Sudharshan" or "AICTE" or "APAAR"
import re
pos = bundle.find('Sudharshan')
print("Position of 'Sudharshan':", pos, "of", len(bundle))
pos_min = bundle.find('APAAR')
print("Position of 'APAAR':", pos_min, "of", len(bundle))

# Let's inspect from pos_min - 2000 to the end
app_code = bundle[min(pos, pos_min) - 500:]
print("App code length:", len(app_code))

with open("app_extracted.js", "w", encoding="utf-8") as out:
    out.write(app_code)

print("Saved app_extracted.js")

