import json

with open("claude_chat.json", "r", encoding="utf-8") as f:
    data = json.load(f)

msg = data["chat_messages"][11]
with open("msg12.txt", "w", encoding="utf-8") as out:
    for item in msg.get("content", []):
        if item.get("type") == "text":
            out.write(item.get("text"))

print("Wrote msg12.txt successfully")

