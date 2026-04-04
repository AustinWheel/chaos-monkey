"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Bot } from "lucide-react";

const TRAFFIC_CONFIG = {
  targets: [
    "pe-hackathon-muy5v.ondigitalocean.app (Prod NYC)",
    "pe-hackathon-prod-sfo-wkpqr.ondigitalocean.app (Prod SFO)",
    "pe-hackathon-staging-f28oj.ondigitalocean.app (Staging)",
  ],
  interval: "5 seconds",
  operations: [
    "GET /health",
    "GET /users",
    "POST /users (random)",
    "POST /urls (random)",
    "GET /urls",
    "GET /r/{code} (redirect)",
    "GET /events",
    "GET /metrics",
  ],
  script: "scripts/synthetic_traffic.py",
};

const CHAOS_CONFIG = {
  targets: ["Prod NYC", "Prod SFO"],
  interval: "Random (every 30 min)",
  actions: [
    "Single 500 error",
    "3s latency injection",
    "5s CPU spike (2 threads)",
    "10-error flood",
  ],
  script: "scripts/chaos_monkey.py",
  alertCheck: "Queries AlertManager after flood actions",
};

export default function ScriptsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Synthetic Traffic & Chaos Monkey</h1>
        <p className="text-sm text-muted-foreground">
          Background scripts that generate traffic and test resilience
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              <CardTitle>Synthetic Traffic Generator</CardTitle>
            </div>
            <CardDescription>
              Continuous realistic traffic against all environments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className="bg-green-500/20 text-green-400 border-green-500/30"
              >
                Running
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Interval</span>
              <span className="text-sm font-mono">{TRAFFIC_CONFIG.interval}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Targets</span>
              <div className="mt-1 space-y-1">
                {TRAFFIC_CONFIG.targets.map((t) => (
                  <div key={t} className="text-xs font-mono text-muted-foreground">
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Operations per cycle</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {TRAFFIC_CONFIG.operations.map((op) => (
                  <Badge key={op} variant="outline" className="text-[10px]">
                    {op}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <code className="text-xs text-muted-foreground">
                {TRAFFIC_CONFIG.script}
              </code>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Stop
                </Button>
                <Button size="sm">Start</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-red-400" />
              <CardTitle>Chaos Monkey</CardTitle>
            </div>
            <CardDescription>
              Automated failure injection to verify alerting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className="bg-green-500/20 text-green-400 border-green-500/30"
              >
                Running
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Interval</span>
              <span className="text-sm font-mono">{CHAOS_CONFIG.interval}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Targets</span>
              <div className="mt-1 space-y-1">
                {CHAOS_CONFIG.targets.map((t) => (
                  <div key={t} className="text-xs font-mono text-muted-foreground">
                    {t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Chaos Actions</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {CHAOS_CONFIG.actions.map((a) => (
                  <Badge key={a} variant="outline" className="text-[10px]">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {CHAOS_CONFIG.alertCheck}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <code className="text-xs text-muted-foreground">
                {CHAOS_CONFIG.script}
              </code>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Stop
                </Button>
                <Button size="sm">Start</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
