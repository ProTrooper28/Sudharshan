with open("app_extracted.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Find JSX elements or functions that return JSX
print("Length of app_extracted.js:", len(code))

# Let's search for navigation items
# We saw tx={aicte:[...], college:[...], student:[...]}
nav_match = re.search(r'tx=\{aicte:\[.*?\],college:\[.*?\],student:\[.*?\]\}', code)
if nav_match:
    print("NAV MATCH FOUND:")
    print(nav_match.group(0)[:500])

# Let's search for how pages are rendered:
# Look for createBrowserRouter or RouterProvider or Routes
routes_match = re.search(r'(?:createBrowserRouter|RouterProvider|Routes|Route).*', code)
if routes_match:
    print("\nROUTER MATCH FOUND:")
    print(routes_match.group(0)[:1000])

