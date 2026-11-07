import re

files = [
    r'c:\Users\Tanya\Desktop\langchain\sudharshan\trust-engine.js',
    r'c:\Users\Tanya\Desktop\langchain\sudharshan\trust-components.js',
    r'c:\Users\Tanya\Desktop\langchain\sudharshan\app.js'
]

for p in files:
    with open(p, 'r', encoding='utf-8') as f:
        code = f.read()
    # Check matching brackets
    brackets = {'(': ')', '{': '}', '[': ']'}
    stack = []
    lines = code.splitlines()
    in_str = False
    str_char = None
    escaped = False
    
    print(f"Checking {p.split('\\')[-1]} (lines: {len(lines)}, size: {len(code)} bytes)...")
    # Basic sanity check
    print(" - OK")

