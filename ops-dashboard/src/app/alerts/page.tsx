"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { relativeTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Alert {
  id: number;
  alert_name: string;
  severity: string;
  status: string;
  summary: string;
  source: string;
  notes: string;
  fired_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  acknowledged_by: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  firing: "bg-red-500/20 text-red-400 border-red-500/30",
  acknowledged: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function AlertsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});

  const params = new URLSearchParams();
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (severityFilter !== "all") params.set("severity", severityFilter);

  const { data, isLoading } = useSWR<Alert[]>(
    `/api/alerts?${params}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  async function updateAlert(
    id: number,
    body: Record<string, string>
  ) {
    await fetch(`/api/alerts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    mutate(`/api/alerts?${params}`);
  }

  async function addNote(id: number) {
    const note = noteInputs[id];
    if (!note) return;
    await updateAlert(id, { notes: note });
    setNoteInputs((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alert Management</h1>
        <p className="text-sm text-muted-foreground">
          Monitor, acknowledge, and resolve alerts
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="flex items-center gap-3 pt-4">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="firing">Firing</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={(v) => v && setSeverityFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          {data && (
            <div className="ml-auto flex gap-2">
              <Badge variant="outline" className="text-red-400">
                {data.filter((a) => a.status === "firing").length} firing
              </Badge>
              <Badge variant="outline" className="text-yellow-400">
                {data.filter((a) => a.status === "acknowledged").length} ack
              </Badge>
              <Badge variant="outline" className="text-green-400">
                {data.filter((a) => a.status === "resolved").length} resolved
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No alerts found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Fired</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.alert_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {alert.summary}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          SEVERITY_COLORS[alert.severity] || ""
                        )}
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          STATUS_COLORS[alert.status] || ""
                        )}
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{alert.source}</TableCell>
                    <TableCell className="text-sm">
                      {relativeTime(alert.fired_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          placeholder="Add note..."
                          value={noteInputs[alert.id] || ""}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({
                              ...prev,
                              [alert.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addNote(alert.id);
                          }}
                          className="h-7 w-32 text-xs"
                        />
                      </div>
                      {alert.notes && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {alert.notes.slice(0, 80)}
                          {alert.notes.length > 80 ? "..." : ""}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {alert.status === "firing" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              updateAlert(alert.id, {
                                status: "acknowledged",
                                acknowledged_by: "ops-dashboard",
                              })
                            }
                          >
                            Ack
                          </Button>
                        )}
                        {alert.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-green-400"
                            onClick={() =>
                              updateAlert(alert.id, { status: "resolved" })
                            }
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
