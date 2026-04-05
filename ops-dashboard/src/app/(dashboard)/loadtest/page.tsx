"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

const TIERS = [
  {
    id: "baseline",
    name: "Bronze",
    vus: 50,
    duration: "30s",
    p95: "<5s",
    errorRate: "<10%",
    script: "loadtests/baseline.js",
  },
  {
    id: "silver",
    name: "Silver",
    vus: 200,
    duration: "30s",
    p95: "<3s",
    errorRate: "<5%",
    script: "loadtests/silver.js",
  },
  {
    id: "gold",
    name: "Gold",
    vus: 500,
    duration: "30s",
    p95: "<5s",
    errorRate: "<5%",
    script: "loadtests/gold.js",
  },
];

const MOCK_RESULTS = [
  {
    tier: "Bronze",
    date: "2026-04-04 10:30",
    target: "prod-nyc",
    reqPerSec: 312,
    p95: "1.2s",
    errorRate: "0.3%",
    status: "passed",
  },
  {
    tier: "Silver",
    date: "2026-04-04 09:15",
    target: "prod-sfo",
    reqPerSec: 845,
    p95: "2.1s",
    errorRate: "1.8%",
    status: "passed",
  },
  {
    tier: "Gold",
    date: "2026-04-03 22:00",
    target: "prod-nyc",
    reqPerSec: 1523,
    p95: "4.7s",
    errorRate: "3.2%",
    status: "passed",
  },
];

export default function LoadTestPage() {
  const [target, setTarget] = useState("staging");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Load Testing</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Run k6 load tests against your environments
          </p>
        </div>
        <Select value={target} onValueChange={(v) => v && setTarget(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prod-nyc">Prod NYC</SelectItem>
            <SelectItem value="prod-sfo">Prod SFO</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "cursor-pointer transition-colors",
              selectedTier === tier.id && "border-primary"
            )}
            onClick={() => setSelectedTier(tier.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <CardTitle className="text-base">{tier.name}</CardTitle>
              </div>
              <CardDescription>{tier.vus} virtual users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-mono">{tier.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">P95 Target</span>
                <span className="font-mono">{tier.p95}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Error Target</span>
                <span className="font-mono">{tier.errorRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Script</span>
                <span className="font-mono text-xs">{tier.script}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTier && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Run Command</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded bg-muted/50 p-3">
              <code className="text-sm">
                k6 run --env BASE_URL=
                {target === "prod-nyc"
                  ? "https://pe-hackathon-muy5v.ondigitalocean.app"
                  : target === "prod-sfo"
                    ? "https://pe-hackathon-prod-sfo-wkpqr.ondigitalocean.app"
                    : "https://pe-hackathon-staging-f28oj.ondigitalocean.app"}{" "}
                {TIERS.find((t) => t.id === selectedTier)?.script}
              </code>
            </div>
            <Button className="mt-3" size="sm">
              Copy Command
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_RESULTS.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{r.tier}</Badge>
                  <Badge variant="outline">{r.target}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {r.date}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono">{r.reqPerSec} req/s</span>
                  <span className="font-mono">p95: {r.p95}</span>
                  <span className="font-mono">err: {r.errorRate}</span>
                  <Badge
                    variant="outline"
                    className={
                      r.status === "passed"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
