"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  parsePrometheusResponse,
  buildQueryParams,
  type PrometheusResponse,
} from "@/lib/prometheus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444", "#a855f7"];

const SERVICES = [
  { id: "health", label: "Health", match: "/health" },
  { id: "users", label: "Users", match: "/users" },
  { id: "urls", label: "URLs", match: "/urls" },
  { id: "redirects", label: "Redirects", match: "/r/" },
  { id: "events", label: "Events", match: "/events" },
] as const;

function serviceFilter(endpoint: string): string {
  // Use regex match for redirects and url IDs
  if (endpoint === "/r/") return 'endpoint=~"/r/.*"';
  if (endpoint === "/urls") return 'endpoint=~"/urls.*"';
  return `endpoint="${endpoint}"`;
}

function buildServiceQueries(endpoint: string) {
  const filter = serviceFilter(endpoint);
  return {
    traffic: `sum by (job) (rate(http_requests_total{${filter}}[1m]))`,
    errors: `sum by (job) (rate(http_errors_total{${filter}}[1m]))`,
    avgLatency: `sum by (job) (rate(http_request_duration_seconds_sum{${filter}}[5m])) / clamp_min(sum by (job) (rate(http_request_duration_seconds_count{${filter}}[5m])), 0.001)`,
  };
}

type GroupBy = "job" | "region" | "environment";

function buildSystemQueries(metric: string, groupBy: GroupBy) {
  return `${metric}`;
}

function usePrometheus(query: string, range: string) {
  const params = buildQueryParams(query, range);
  return useSWR<PrometheusResponse>(
    `/api/prometheus?${params}`,
    fetcher,
    { refreshInterval: 30000 }
  );
}

function formatTick(ts: number) {
  return format(new Date(ts), "HH:mm");
}

function MetricChart({
  title,
  query,
  range,
  unit,
  type = "line",
  labelKey = "job",
}: {
  title: string;
  query: string;
  range: string;
  unit?: string;
  type?: "line" | "area";
  labelKey?: string;
}) {
  const { data, isLoading, error: fetchError } = usePrometheus(query, range);
  const chartData = data ? parsePrometheusResponse(data, labelKey) : [];
  const series = chartData.length
    ? Object.keys(chartData[0]).filter((k) => k !== "time")
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[180px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        ) : fetchError ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-destructive">
            Failed to load
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            {type === "area" ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" tickFormatter={formatTick} stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => unit ? `${v.toFixed(1)}${unit}` : v.toFixed(2)} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", fontSize: 12 }}
                  labelFormatter={(v) => format(new Date(v as number), "HH:mm:ss")}
                  formatter={(value) => [`${Number(value).toFixed(3)}${unit || ""}`,]}
                />
                <Legend />
                {series.map((s, i) => (
                  <Area key={s} type="monotone" dataKey={s} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.1} strokeWidth={1.5} />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" tickFormatter={formatTick} stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={11} tickFormatter={(v) => unit ? `${v.toFixed(1)}${unit}` : v.toFixed(2)} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", fontSize: 12 }}
                  labelFormatter={(v) => format(new Date(v as number), "HH:mm:ss")}
                  formatter={(value) => [`${Number(value).toFixed(3)}${unit || ""}`,]}
                />
                <Legend />
                {series.map((s, i) => (
                  <Line key={s} type="monotone" dataKey={s} stroke={COLORS[i % COLORS.length]} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default function MetricsPage() {
  const [range, setRange] = useState("1h");
  const [activeService, setActiveService] = useState("health");
  const [systemGroupBy, setSystemGroupBy] = useState<GroupBy>("job");

  const service = SERVICES.find((s) => s.id === activeService) || SERVICES[0];
  const queries = buildServiceQueries(service.match);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Metrics Dashboard</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Per-endpoint metrics and system resource usage
          </p>
        </div>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            <TabsTrigger value="15m">15m</TabsTrigger>
            <TabsTrigger value="1h">1h</TabsTrigger>
            <TabsTrigger value="6h">6h</TabsTrigger>
            <TabsTrigger value="24h">24h</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Service tabs */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Endpoint Metrics</h2>
        <Tabs value={activeService} onValueChange={(v) => v != null && setActiveService(String(v))}>
          <TabsList>
            {SERVICES.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricChart
          title={`${service.label} — Traffic (req/s)`}
          query={queries.traffic}
          range={range}
          unit=" req/s"
          type="area"
        />
        <MetricChart
          title={`${service.label} — Errors (err/s)`}
          query={queries.errors}
          range={range}
          unit=" err/s"
          type="area"
        />
        <MetricChart
          title={`${service.label} — Avg Latency (s)`}
          query={queries.avgLatency}
          range={range}
          unit="s"
        />
      </div>

      {/* System metrics */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">System Metrics</h2>
        <Select value={systemGroupBy} onValueChange={(v) => v && setSystemGroupBy(v as GroupBy)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="job">By Instance</SelectItem>
            <SelectItem value="region">By Region</SelectItem>
            <SelectItem value="environment">By Environment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MetricChart
          title="CPU Usage (%)"
          query={buildSystemQueries("system_cpu_percent", systemGroupBy)}
          range={range}
          unit="%"
          labelKey={systemGroupBy}
        />
        <MetricChart
          title="Memory Usage (%)"
          query={buildSystemQueries("system_memory_percent", systemGroupBy)}
          range={range}
          unit="%"
          labelKey={systemGroupBy}
        />
      </div>
    </div>
  );
}
