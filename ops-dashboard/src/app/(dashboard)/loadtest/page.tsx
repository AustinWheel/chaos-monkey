"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { relativeTime } from "@/lib/format";
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

interface LoadTestResult {
  id: number;
  tier: string;
  target: string;
  req_per_sec: number;
  p95_ms: number;
  error_rate: number;
  status: string;
  vus: number;
  duration: string;
  run_at: string;
}

export default function LoadTestPage() {
  const [target, setTarget] = useState("staging");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const { data: results, isLoading } = useSWR<LoadTestResult[]>(
    "/api/loadtest",
    fetcher,
    { refreshInterval: 15000 }
  );

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
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          ) : !results || results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No load test results yet. Run a k6 test to see results here.
            </p>
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">{r.tier}</Badge>
                    <Badge variant="outline">{r.target}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {relativeTime(r.run_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-mono">{Math.round(r.req_per_sec)} req/s</span>
                    <span className="font-mono">p95: {(r.p95_ms / 1000).toFixed(1)}s</span>
                    <span className="font-mono">err: {r.error_rate.toFixed(1)}%</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
