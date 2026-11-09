with open('sudharshan_bundle.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re
print("Searching for URLs, github, emails:")
for url in set(re.findall(r'https?://[^\s"\'<>]+', s)):
    print(url)

print("\nSearching for authors / team names:")
for m in set(re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', s)):
    print(m)

