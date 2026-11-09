import urllib.request
import json

url = "https://claude.ai/api/chat_snapshots/afcc241c-b3ae-479a-9dc7-d7af96e776c4?rendering_mode=messages&render_all_tools=true"
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json'
})

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("Success! Keys:", data.keys())
        with open("claude_chat.json", "w", encoding="utf-8") as out:
            json.dump(data, out, indent=2)
        print("Saved to claude_chat.json. Size:", len(json.dumps(data)))
except Exception as e:
    print("Error:", e)

