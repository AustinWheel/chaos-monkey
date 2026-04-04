"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const DEPLOYMENTS = [
  {
    id: 1,
    region: "NYC",
    env: "prod",
    version: "0.1.0",
    commit: "04e36e2",
    status: "active",
    timestamp: "2026-04-04 08:30:00",
    message: "Add CI/CD pipeline, synthetic traffic, chaos monkey",
  },
  {
    id: 2,
    region: "SFO",
    env: "prod",
    version: "0.1.0",
    commit: "04e36e2",
    status: "active",
    timestamp: "2026-04-04 08:31:15",
    message: "Add CI/CD pipeline, synthetic traffic, chaos monkey",
  },
  {
    id: 3,
    region: "NYC",
    env: "staging",
    version: "0.1.0",
    commit: "04e36e2",
    status: "active",
    timestamp: "2026-04-04 08:25:00",
    message: "Add CI/CD pipeline, synthetic traffic, chaos monkey",
  },
  {
    id: 4,
    region: "NYC",
    env: "prod",
    version: "0.0.9",
    commit: "f5b6761",
    status: "superseded",
    timestamp: "2026-04-03 22:15:00",
    message: "Add multi-region support, Loki logging, alert management",
  },
  {
    id: 5,
    region: "SFO",
    env: "prod",
    version: "0.0.9",
    commit: "f5b6761",
    status: "superseded",
    timestamp: "2026-04-03 22:16:30",
    message: "Add multi-region support, Loki logging, alert management",
  },
  {
    id: 6,
    region: "NYC",
    env: "prod",
    version: "0.0.8",
    commit: "6bb8ac2",
    status: "superseded",
    timestamp: "2026-04-03 18:00:00",
    message: "Add documentation and raise coverage requirement",
  },
];

const STATUS_STYLES: Record<string, string> = {
  active: "text-green-400 bg-green-500/20 border-green-500/30",
  building: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  error: "text-red-400 bg-red-500/20 border-red-500/30",
  superseded: "text-muted-foreground bg-muted/50",
};

export default function DeploymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Deployment History</h1>
        <p className="text-sm text-muted-foreground">
          Recent deployments across all regions
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead>Env</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Commit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEPLOYMENTS.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Badge variant="outline">{d.region}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={d.env === "prod" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {d.env}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {d.version}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {d.commit}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", STATUS_STYLES[d.status] || "")}
                    >
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.timestamp}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {d.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
