with open("sudharshan.css", "r", encoding="utf-8") as f:
    css = f.read()

import re
classes = set(re.findall(r'\.([a-zA-Z0-9_\-]+)', css))
print(f"Total CSS classes: {len(classes)}")
interesting = [c for c in classes if any(k in c for k in ['nav', 'header', 'footer', 'card', 'table', 'badge', 'btn', 'button', 'qr', 'status', 'modal', 'grid', 'portal', 'dashboard', 'tab', 'alert', 'pill', 'tag'])]
for c in sorted(interesting)[:60]:
    print(" -", c)

