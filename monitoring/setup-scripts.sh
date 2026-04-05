#!/bin/bash
# One-time setup for synthetic traffic and chaos monkey on the monitoring droplet.
# Run as root: bash setup-scripts.sh

set -e

echo "==> Downloading latest scripts..."
curl -sf -o /root/synthetic_traffic.py https://raw.githubusercontent.com/AustinWheel/chaos-monkey/main/scripts/synthetic_traffic.py
curl -sf -o /root/chaos_monkey.py https://raw.githubusercontent.com/AustinWheel/chaos-monkey/main/scripts/chaos_monkey.py

echo "==> Installing systemd units..."
REPO_DIR="$(cd "$(dirname "$0")" && pwd)/systemd"
cp "$REPO_DIR/synthetic-traffic.service" /etc/systemd/system/
cp "$REPO_DIR/chaos-monkey.service" /etc/systemd/system/
cp "$REPO_DIR/chaos-monkey.timer" /etc/systemd/system/
cp "$REPO_DIR/script-updater.service" /etc/systemd/system/
cp "$REPO_DIR/script-updater.timer" /etc/systemd/system/

echo "==> Reloading systemd..."
systemctl daemon-reload

echo "==> Enabling and starting services..."
systemctl enable --now synthetic-traffic.service
systemctl enable --now chaos-monkey.timer
systemctl enable --now script-updater.timer

echo "==> Status:"
systemctl is-active synthetic-traffic.service
systemctl list-timers --no-pager | grep -E 'chaos|script'

echo "==> Done. Scripts will auto-update from GitHub every 10 minutes."
