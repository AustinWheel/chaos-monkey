"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Flame,
  Cpu,
  Clock,
  HeartOff,
  Siren,
} from "lucide-react";

interface ChaosAction {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  params?: { key: string; label: string; default: number; max: number }[];
  destructive?: boolean;
}

const CHAOS_ACTIONS: ChaosAction[] = [
  {
    id: "error",
    name: "Trigger 500 Error",
    description: "Simulate a single 500 Internal Server Error",
    icon: AlertTriangle,
    color: "text-orange-400",
    params: [{ key: "status", label: "Status Code", default: 500, max: 599 }],
  },
  {
    id: "error-flood",
    name: "Error Flood",
    description: "Generate a burst of error responses",
    icon: Flame,
    color: "text-red-400",
    params: [{ key: "count", label: "Error Count", default: 50, max: 200 }],
    destructive: true,
  },
  {
    id: "cpu",
    name: "CPU Spike",
    description: "Simulate a CPU spike with configurable duration and threads",
    icon: Cpu,
    color: "text-yellow-400",
    params: [
      { key: "duration", label: "Duration (s)", default: 10, max: 60 },
      { key: "threads", label: "Threads", default: 4, max: 8 },
    ],
  },
  {
    id: "latency",
    name: "Latency Injection",
    description: "Add artificial delay to response times",
    icon: Clock,
    color: "text-blue-400",
    params: [{ key: "delay", label: "Delay (s)", default: 5, max: 30 }],
  },
  {
    id: "health-fail",
    name: "Health Fail",
    description: "Return 503 to simulate service degradation",
    icon: HeartOff,
    color: "text-pink-400",
  },
  {
    id: "critical",
    name: "Critical Alert",
    description: "Send a critical alert directly to Discord",
    icon: Siren,
    color: "text-red-500",
    destructive: true,
  },
];

interface ChaosResult {
  action: string;
  target: string;
  status?: number;
  response?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

export default function ChaosPage() {
  const [target, setTarget] = useState("staging");
  const [results, setResults] = useState<ChaosResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, Record<string, number>>>({});

  const getParam = (actionId: string, key: string, defaultVal: number) =>
    params[actionId]?.[key] ?? defaultVal;

  const setParam = (actionId: string, key: string, value: number) =>
    setParams((prev) => ({
      ...prev,
      [actionId]: { ...prev[actionId], [key]: value },
    }));

  async function executeChaos(action: ChaosAction) {
    setLoading(action.id);
    const actionParams: Record<string, number> = {};
    for (const p of action.params || []) {
      actionParams[p.key] = getParam(action.id, p.key, p.default);
    }

    try {
      const res = await fetch("/api/chaos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action.id, target, ...actionParams }),
      });
      const data = await res.json();
      setResults((prev) => [data, ...prev]);
    } catch (err) {
      setResults((prev) => [
        {
          action: action.id,
          target,
          error: err instanceof Error ? err.message : "Request failed",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Chaos Engineering Console</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Inject failures to test resilience and alerting
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

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CHAOS_ACTIONS.map((action) => {
          const Icon = action.icon;
          const ActionButton = (
            <Button
              variant={action.destructive ? "destructive" : "default"}
              size="sm"
              disabled={loading === action.id}
              onClick={
                action.destructive ? undefined : () => executeChaos(action)
              }
              className="w-full"
            >
              {loading === action.id ? "Executing..." : "Execute"}
            </Button>
          );

          return (
            <Card key={action.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-5 w-5", action.color)} />
                  <CardTitle className="text-sm">{action.name}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {action.params?.map((p) => (
                  <div key={p.key} className="space-y-1">
                    <Label className="text-xs">{p.label}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={p.max}
                      value={getParam(action.id, p.key, p.default)}
                      onChange={(e) =>
                        setParam(action.id, p.key, Number(e.target.value))
                      }
                      className="h-8"
                    />
                  </div>
                ))}
                {action.destructive ? (
                  <Dialog>
                    <DialogTrigger>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={loading === action.id}
                        className="w-full"
                      >
                        {loading === action.id ? "Executing..." : "Execute"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm: {action.name}</DialogTitle>
                        <DialogDescription>
                          This will execute {action.name.toLowerCase()} against{" "}
                          <strong>{target}</strong>. Are you sure?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => executeChaos(action)}
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  ActionButton
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Response Log</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[300px]">
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No chaos actions executed yet
              </p>
            ) : (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="rounded border border-border bg-muted/30 p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant={r.error ? "destructive" : "default"}>
                        {r.action}
                      </Badge>
                      <Badge variant="outline">{r.target}</Badge>
                      {r.status && (
                        <Badge
                          variant="outline"
                          className={cn(
                            r.status >= 500
                              ? "text-red-400"
                              : r.status >= 400
                                ? "text-yellow-400"
                                : "text-green-400"
                          )}
                        >
                          {r.status}
                        </Badge>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="overflow-auto text-xs">
                      {JSON.stringify(r.response || r.error, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
