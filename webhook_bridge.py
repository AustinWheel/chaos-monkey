"""
Bridge between Alertmanager and Discord.

Alertmanager sends complex JSON payloads that Discord can't parse.
This script receives Alertmanager webhooks and reformats them into
Discord-compatible messages.

Run: uv run webhook_bridge.py
Listens on port 9095
"""

import json
import urllib.request

from flask import Flask, request as req

app = Flask(__name__)

DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1489813519560868031/VnmqUl_1xxH5XaDNC6m0JuxEk0YX-6-yw5qtLkXKXIgSxNX-BYfgaP6AM7EuQO7cmK6B"


def format_alert(alert):
    status = alert.get("status", "unknown").upper()
    labels = alert.get("labels", {})
    annotations = alert.get("annotations", {})

    name = labels.get("alertname", "Unknown Alert")
    severity = labels.get("severity", "unknown")
    summary = annotations.get("summary", "No summary")
    description = annotations.get("description", "No description")

    icon = "🔴" if status == "FIRING" else "🟢"

    return (
        f"{icon} **{name}** — {status}\n"
        f"**Severity:** {severity}\n"
        f"**Summary:** {summary}\n"
        f"**Description:** {description}"
    )


@app.route("/webhook", methods=["POST"])
def webhook():
    data = req.get_json(force=True)
    alerts = data.get("alerts", [])

    if not alerts:
        return "no alerts", 200

    messages = [format_alert(a) for a in alerts]
    content = "\n\n---\n\n".join(messages)

    payload = json.dumps({"content": content}).encode("utf-8")
    r = urllib.request.Request(
        DISCORD_WEBHOOK,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "AlertmanagerBridge/1.0",
        },
    )
    try:
        urllib.request.urlopen(r)
        print(f"Forwarded {len(alerts)} alert(s) to Discord")
    except Exception as e:
        print(f"Discord error: {e}")

    return "ok", 200


if __name__ == "__main__":
    print("Webhook bridge listening on http://0.0.0.0:9095/webhook")
    app.run(host="0.0.0.0", port=9095)
