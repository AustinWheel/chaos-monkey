# Service Restart Demo Script

## What we're demonstrating

When an app instance crashes, Docker's `restart: always` policy automatically restarts it. We kill the main process inside a container to simulate a crash — Docker detects the exit and spins up a replacement. The other instances keep serving traffic through the nginx load balancer, so there's zero downtime.

The a similar behavior occurs in production: App Platform restarts crashed containers automatically, and routes traffic to the healthy instances.

## Setup

Open a terminal in the project root with the local stack running:
```bash
docker compose up -d
```

## Demo

```bash
# All apps instances are running
➜  hackathon git:(main) ✗ docker ps --format "table {{.Names}}\t{{.Status}}" | grep app
hackathon-app3-1           Up 5 minutes
hackathon-app2-1           Up 5 minutes
hackathon-app1-1           Up 57 seconds

# We kill app1
➜  hackathon git:(main) ✗ docker exec hackathon-app1-1 /bin/sh -c 'kill 1'

# App1 will automatically restart (as seen by Up time changing)
➜  hackathon git:(main) ✗ docker ps --format "table {{.Names}}\t{{.Status}}" | grep app
hackathon-app3-1           Up 5 minutes
hackathon-app2-1           Up 5 minutes
hackathon-app1-1           Up 7 seconds

# Health check still successful
➜  hackathon git:(main) ✗ curl -s http://localhost:8080/health | python3 -m json.tool
{
    "database": "connected",
    "environment": "dev",
    "instance_id": "1b427078",
    "region": "local",
    "status": "ok",
    "uptime_seconds": 351.8,
    "version": "0.1.0"
}

### 1. Show all 3 instances running

```bash
docker ps --format "table {{.Names}}\t{{.Status}}" | grep app
```

Nginx routed traffic to app2 and app3 while app1 was restarting. No requests were dropped.