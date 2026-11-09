import os
import re

root_dir = r'c:\Users\Tanya\Desktop\langchain'

results = []

for root, dirs, files in os.walk(root_dir):
    dirs[:] = [d for d in dirs if d.lower() not in {'.venv', '.git', '__pycache__', 'node_modules', 'dist'}]
    for file in files:
        filepath = os.path.join(root, file)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            lines = content.splitlines()
            for line_no, line in enumerate(lines, 1):
                lower_line = line.lower()
                if 'tanya' in lower_line:
                    line_without_userpath = re.sub(r'users[\\/]tanya', '', lower_line)
                    has_content_tanya = 'tanya' in line_without_userpath
                    results.append({
                        'file': os.path.relpath(filepath, root_dir),
                        'line_no': line_no,
                        'line': line.strip(),
                        'in_content': has_content_tanya
                    })
        except Exception as e:
            pass

content_occurrences = [r for r in results if r['in_content'] and not r['file'].endswith('scan_tanya.py')]

with open('tanya_findings.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total content occurrences found: {len(content_occurrences)}\n\n")
    for r in content_occurrences:
        out.write(f"{r['file']}:{r['line_no']}: {r['line']}\n")

print(f"Total content occurrences written: {len(content_occurrences)}")
for r in content_occurrences:
    ascii_line = r['line'].encode('ascii', 'replace').decode('ascii')
    print(f"{r['file']}:{r['line_no']}: {ascii_line[:120]}")
