# Observability Guide

## Deployed App

**App:** https://pe-hackathon-muy5v.ondigitalocean.app

| Endpoint | Description |
|----------|-------------|
| `/health` | Health check — returns `{"status": "ok"}` |
| `/metrics` | CPU and memory usage (JSON) |
| `/logs` | View recent structured logs (JSON) |
| `/logs?level=ERROR` | Filter logs by level |
| `/logs?limit=10` | Limit number of log entries |
| `/prom-metrics` | Prometheus text format metrics |

## Monitoring Stack

Hosted on a DigitalOcean Droplet at `143.198.173.164`.

| Service | URL | Login |
|---------|-----|-------|
| Grafana | http://143.198.173.164:3000 | admin / admin |
| Prometheus | http://143.198.173.164:9090 | — |
| Alertmanager | http://143.198.173.164:9093 | — |

### Grafana Dashboard

The "Overview" dashboard tracks the 4 golden signals:
- **Traffic** — request rate per second
- **Errors** — error rate percentage
- **Latency** — p50, p95, p99 response times
- **Saturation** — CPU and memory usage

### Alerts

Configured in `monitoring/alert_rules.yml`. Alerts fire to Discord via Alertmanager.

| Alert | Condition | Severity |
|-------|-----------|----------|
| ServiceDown | App unreachable for 1 minute | Critical |
| HighErrorRate | >10% of requests are 5xx over 2 minutes | Warning |

### Chaos Endpoints (for testing alerts)

| Endpoint | What it does |
|----------|-------------|
| `/chaos/error` | Returns a 500 error |
| `/chaos/error-flood?count=50` | Generates a burst of errors |
| `/chaos/cpu?duration=10&threads=4` | Spikes CPU |
| `/chaos/latency?delay=5` | Simulates slow response |
| `/chaos/health-fail` | Returns 503 |
| `/chaos/critical` | Sends alert directly to Discord |

## Local Development

### Start the app

```bash
uv run run.py  # http://localhost:5001
```

### Start monitoring stack

```bash
docker compose up -d
```

Local monitoring uses the same ports:
- Grafana: http://localhost:3000 (or 3001 if 3000 is taken)
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093

**Note:** `monitoring/prometheus.yml` currently points at the deployed app. To monitor locally, change the target back to `host.docker.internal:5001` and remove `scheme: https`.

## Structured Logging

All requests are automatically logged as JSON with:
- `timestamp`, `level`, `method`, `path`, `status`, `remote_addr`

Route-specific logs include a `component` field for filtering.

Example log entry:
```json
{
  "timestamp": "2026-04-04 15:43:26,581",
  "level": "INFO",
  "message": "Request completed",
  "method": "GET",
  "path": "/urls",
  "status": 200
}
```

## Architecture

```
                    ┌──────────────────────────────┐
                    │  DigitalOcean App Platform    │
                    │                              │
  Users ──────────▶ │  Flask App (:8080)           │
                    │  /health /urls /users etc.   │
                    │  /prom-metrics               │
                    └──────────────┬───────────────┘
                                   │
                    Prometheus scrapes every 15s
                                   │
                    ┌──────────────▼───────────────┐
                    │  DO Droplet (143.198.173.164) │
                    │                              │
                    │  Prometheus (:9090)           │
                    │  Grafana    (:3000)           │
                    │  Alertmanager (:9093)         │
                    └──────────────┬───────────────┘
                                   │
                            Alert fires
                                   │
                                   ▼
                              Discord 🔔
```
