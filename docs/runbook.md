# Incident Runbook

## How to use this doc
When an alert fires at 3 AM, open this page. Find the alert name. Follow the steps. Don't think — just do.

## Access

| System | URL | Credentials |
|--------|-----|-------------|
| App | https://pe-hackathon-muy5v.ondigitalocean.app | — |
| Grafana | http://143.198.173.164:3000 | admin / admin |
| Prometheus | http://143.198.173.164:9090 | — |
| Alertmanager | http://143.198.173.164:9093 | — |
| DO Dashboard | https://cloud.digitalocean.com/apps | DO account |
| App Logs | https://pe-hackathon-muy5v.ondigitalocean.app/logs | — |

---

## Alert: ServiceDown

**What it means:** Prometheus cannot reach the app for over 1 minute.

**Steps:**

1. Check if the app responds:
   ```
   curl https://pe-hackathon-muy5v.ondigitalocean.app/health
   ```
2. If no response, check DigitalOcean App Platform:
   - Go to https://cloud.digitalocean.com/apps
   - Check if a deployment is in progress or errored
   - Check runtime logs for crash errors
3. If the app crashed, DO will auto-restart it. Wait 2 minutes and re-check.
4. If it's stuck in a crash loop, check the deploy logs:
   ```
   doctl apps logs 1c0e8082-1afa-4fa0-a941-4877f46f6a48 --type=deploy
   ```
5. If a bad deploy caused it, roll back:
   ```
   doctl apps list-deployments 1c0e8082-1afa-4fa0-a941-4877f46f6a48
   # Find the last working deployment ID, then:
   doctl apps create-deployment 1c0e8082-1afa-4fa0-a941-4877f46f6a48 --force-rebuild
   ```
6. If the database is down, check DO managed database status:
   ```
   doctl databases get dacc1fe1-631a-4746-9bd1-606294a1dc32
   ```

**Resolved when:** `/health` returns 200 and Prometheus target shows "up".

---

## Alert: HighErrorRate

**What it means:** More than 10% of requests are returning 5xx errors over a 2-minute window.

**Steps:**

1. Check what's failing — open the logs filtered to errors:
   ```
   curl "https://pe-hackathon-muy5v.ondigitalocean.app/logs?level=ERROR&limit=20"
   ```
2. Look at the `path` and `component` fields to identify which endpoint is broken.
3. Check Grafana dashboard for patterns:
   - Is it one endpoint or all of them?
   - Did it start after a deploy?
   - Is the database healthy? (Check `/health` for `"database": "connected"`)
4. If it started after a deploy:
   - Check the latest commit on `main`
   - Revert or fix and push
5. If the database is the problem:
   - Check connection pool (too many connections?)
   - Check DO database metrics in the cloud console
6. If it's a traffic spike causing errors:
   - Check Grafana "Traffic" panel — is there an unusual spike?
   - Redis may be down — check if cache is working
   - Scale up instances if needed via `.do/app.yaml`

**Resolved when:** Error rate drops below 10% on Grafana dashboard.

---

## Alert: High CPU (if configured)

**What it means:** CPU usage above 90% for sustained period.

**Steps:**

1. Check `/metrics` to confirm:
   ```
   curl https://pe-hackathon-muy5v.ondigitalocean.app/metrics
   ```
2. Check Grafana "Saturation" panel — is it sustained or a spike?
3. If sustained:
   - Check if someone triggered `/chaos/cpu` (look in logs)
   - Check for runaway queries or infinite loops in recent deploys
4. If it's legitimate traffic, consider scaling:
   - Increase `instance_count` in `.do/app.yaml`
   - Or increase `instance_size_slug` from `basic-xxs` to `basic-xs`

---

## General: How to check system health quickly

```bash
# App health
curl https://pe-hackathon-muy5v.ondigitalocean.app/health

# System metrics
curl https://pe-hackathon-muy5v.ondigitalocean.app/metrics

# Recent errors
curl "https://pe-hackathon-muy5v.ondigitalocean.app/logs?level=ERROR&limit=10"

# Prometheus targets
curl http://143.198.173.164:9090/api/v1/targets

# Active alerts
curl http://143.198.173.164:9093/api/v2/alerts
```

## Escalation

If the above steps don't resolve the issue:
1. Check Discord for any messages from teammates
2. Check DigitalOcean status page: https://status.digitalocean.com
3. SSH into monitoring droplet if Prometheus/Grafana are down:
   ```
   ssh root@143.198.173.164
   docker compose ps
   docker compose restart
   ```
