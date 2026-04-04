"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { parseLokiResponse, buildLogQuery, type LokiResponse, type LogEntry } from "@/lib/loki";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const LEVEL_COLORS: Record<string, string> = {
  ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
  WARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  INFO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DEBUG: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function LogRow({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="cursor-pointer border-b border-border px-3 py-2 transition-colors hover:bg-muted/50"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {format(entry.timestamp, "HH:mm:ss.SSS")}
        </span>
        <Badge
          variant="outline"
          className={cn("shrink-0 text-[10px]", LEVEL_COLORS[entry.level] || "")}
        >
          {entry.level}
        </Badge>
        {entry.labels.region && (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {entry.labels.region}
          </Badge>
        )}
        <span className="truncate text-sm">{entry.message}</span>
      </div>
      {expanded && entry.parsed && (
        <pre className="mt-2 overflow-auto rounded bg-muted/50 p-3 text-xs">
          {JSON.stringify(entry.parsed, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [environment, setEnvironment] = useState("all");
  const [level, setLevel] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const query = buildLogQuery({ region, environment, level, search });
  const params = new URLSearchParams({ query, limit: "200" });

  const { data, isLoading } = useSWR<LokiResponse>(
    `/api/loki?${params}`,
    fetcher,
    { refreshInterval: autoRefresh ? 5000 : 0 }
  );

  const entries = data ? parseLokiResponse(data) : [];

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Log Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Search and filter logs from Loki
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-3 pt-4">
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={region} onValueChange={(v) => v && setRegion(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="nyc">NYC</SelectItem>
              <SelectItem value="sfo">SFO</SelectItem>
            </SelectContent>
          </Select>
          <Select value={environment} onValueChange={(v) => v && setEnvironment(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Envs</SelectItem>
              <SelectItem value="prod">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={(v) => v && setLevel(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="DEBUG">Debug</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </Label>
          </div>
          <Badge variant="outline" className="ml-auto">
            {entries.length} entries
          </Badge>
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Log Stream</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-18rem)]">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No logs found
            </div>
          ) : (
            entries.map((entry, i) => <LogRow key={`${entry.nanoseconds}-${i}`} entry={entry} />)
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
