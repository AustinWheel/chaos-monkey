# Incident Report: Service Degradation Under Extreme Load

## Demo Script

### Setup
Open 3 windows before starting:
1. **Terminal** — to run the stress test
2. **Browser** — Grafana Overview dashboard: http://143.198.173.164:3000/d/overview/
3. **Browser** — Discord alert channel

### 1. Trigger the stress test

Run a k6 stress test that ramps to 1000 concurrent users — well beyond our service capacity:
```bash
k6 run --env BASE_URL=https://pe-hackathon-hni9m.ondigitalocean.app loadtests/stress.js
```

### 2. Alert fires in Discord (~1-2 min)

Screenshot the Discord notification. Expected alerts:
- **High Error Rate** — error rate exceeds 10% as the service becomes overwhelmed
- **High P95 Latency** — p95 exceeds 2s as requests queue up

> TODO: Screenshot of Discord alert

### 3. Investigate in Grafana (~during the test)

Open the Overview dashboard. You'll see:
- **Error Rate panel** — spike above 10%
- **Latency panel** — p95/p99 spiking well above normal
- **In-Flight Requests** — maxed out, showing saturation
- **RPS panel** — request rate climbing then plateauing as the service can't keep up

> TODO: Screenshot of Grafana showing the spike

### 4. Drill into logs

Open the Logs Explorer: http://143.198.173.164:3000/d/logs/

Query for errors:
```
{job="flask-app", environment="prod"} | json | level="ERROR"
```

You'll see gunicorn worker timeout errors and connection pool exhaustion as the database can't keep up with 1000 concurrent users.

> TODO: Screenshot of Loki error logs

### 5. Identify root cause

From the dashboard and logs:
- **Traffic panel** shows request rate far beyond normal (~50 req/s normal → 500+ req/s during test)
- **Saturation panel** shows in-flight requests maxed out
- **Latency panel** shows queuing (p95 >> p50)
- **CPU panel** shows high utilization

**Root cause:** The service has 3 instances with 6 workers each (18 total workers). At 1000 concurrent users with 0.2s think time, we're generating ~5000 req/s — roughly 280x our normal traffic. The connection pool (32 connections per instance) and worker count are the bottleneck.

### 6. Resolution

The stress test ends and traffic returns to normal. Within 1-2 minutes:
- Error rate drops back to 0%
- Latency returns to baseline (~50-100ms p95)
- In-flight requests return to normal

> TODO: Screenshot of Grafana showing recovery

**If this were a real incident**, the response would be:
1. Identify the traffic source (load test, DDoS, or viral traffic)
2. If legitimate traffic: scale instances via `.do/app.yaml` (`instance_count: 5` or more)
3. If attack: enable stricter rate limiting or block the source IP
4. Post-incident: update the [capacity plan](../scalability/capacity-plan.md) with new limits

## Summary

| Phase | What we saw | Where |
|---|---|---|
| Detection | Discord alert: "High Error Rate" | Discord |
| Triage | Error rate spike, latency spike, high saturation | Grafana Overview |
| Root cause | Traffic 280x above normal, workers saturated | Grafana Traffic + Saturation panels |
| Logs | Worker timeouts, connection pool errors | Grafana Logs Explorer |
| Resolution | Traffic returned to normal after test ended | Grafana Overview |
| Prevention | Scale instances or add rate limiting for spike traffic | `.do/app.yaml` / `app/__init__.py` |
