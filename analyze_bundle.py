import re

with open('sudharshan_bundle.js', 'r', encoding='utf-8') as f:
    s = f.read()

children_texts = re.findall(r'children:\s*\"([^\"]{3,100})\"', s)
print(f"Total children strings: {len(children_texts)}")
for c in sorted(set(children_texts)):
    print("CHILDREN:", c)

titles = re.findall(r'title:\s*\"([^\"]{3,100})\"', s)
for t in sorted(set(titles)):
    print("TITLE:", t)

labels = re.findall(r'label:\s*\"([^\"]{3,100})\"', s)
for l in sorted(set(labels)):
    print("LABEL:", l)

