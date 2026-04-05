#!/bin/bash
# Pull latest config from git and restart the monitoring stack on the droplet.
# Usage: ./scripts/update-monitoring.sh

set -e

MONITORING_IP="143.198.173.164"

echo "Pulling latest from git..."
ssh root@$MONITORING_IP 'cd /opt/monitoring-repo && git pull origin main'

if [ "$1" = "--reset" ]; then
  echo "Resetting Grafana (wiping volume)..."
  ssh root@$MONITORING_IP 'cd /root/monitoring && docker compose stop grafana && docker compose rm -f grafana && docker volume rm monitoring_grafana-data && docker compose up -d grafana'
else
  echo "Restarting Grafana and Prometheus..."
  ssh root@$MONITORING_IP 'cd /root/monitoring && docker compose restart grafana prometheus'
fi

echo "Done. Grafana: http://$MONITORING_IP:3000"
