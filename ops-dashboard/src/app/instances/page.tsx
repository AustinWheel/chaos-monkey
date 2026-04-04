"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { formatDuration } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstanceHealth {
  instanceId: string;
  name: string;
  region: string;
  env: string;
  status: string;
  latencyMs: number;
  error: string | null;
  data: {
    status: string;
    version: string;
    uptime_seconds: number;
    region: string;
    environment: string;
    instance_id: string;
    database: string;
  } | null;
}

export default function InstancesPage() {
  const { data, error, isLoading } = useSWR<InstanceHealth[]>(
    "/api/health",
    fetcher,
    { refreshInterval: 15000 }
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Instance Overview</h1>
        <p className="text-sm text-muted-foreground">
          Health status across all regions and environments
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to fetch health data: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.map((instance) => {
            const isHealthy = instance.status === "ok";
            const isDegraded = instance.status === "degraded";
            const statusColor = isHealthy
              ? "bg-green-500"
              : isDegraded
                ? "bg-yellow-500"
                : "bg-red-500";
            const borderColor = isHealthy
              ? "border-l-green-500"
              : isDegraded
                ? "border-l-yellow-500"
                : "border-l-red-500";

            return (
              <Card
                key={instance.instanceId}
                className={cn("border-l-4", borderColor)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{instance.name}</CardTitle>
                    <div className={cn("h-3 w-3 rounded-full", statusColor)} />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {instance.region.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={instance.env === "prod" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {instance.env}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {instance.data ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-mono">
                          {formatDuration(instance.data.uptime_seconds)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-mono">
                          {instance.data.version}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database</span>
                        <span
                          className={cn(
                            "font-mono",
                            instance.data.database === "connected"
                              ? "text-green-400"
                              : "text-red-400"
                          )}
                        >
                          {instance.data.database}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Instance</span>
                        <span className="font-mono text-xs">
                          {instance.data.instance_id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latency</span>
                        <span className="font-mono">
                          {instance.latencyMs}ms
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-400">
                      {instance.error || "Unreachable"}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
