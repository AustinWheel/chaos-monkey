"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { relativeTime } from "@/lib/format";
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

interface Deployment {
  id: number;
  region: string;
  env: string;
  commit: string;
  status: string;
  timestamp: string;
  message: string;
  run_id: number;
}

const STATUS_STYLES: Record<string, string> = {
  active: "text-green-400 bg-green-500/20 border-green-500/30",
  building: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  error: "text-red-400 bg-red-500/20 border-red-500/30",
  superseded: "text-muted-foreground bg-muted/50",
};

export default function DeploymentsPage() {
  const { data, isLoading } = useSWR<Deployment[]>(
    "/api/deployments",
    fetcher,
    { refreshInterval: 30000 }
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Deployment History</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Recent deployments across all regions (live from GitHub Actions)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          ) : !data || data.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No deployments found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Env</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deployed</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((d) => (
                  <TableRow key={`${d.id}-${d.region}`}>
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
                    <TableCell>
                      <a
                        href={`https://github.com/AustinWheel/chaos-monkey/commit/${d.commit}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-400 hover:underline"
                      >
                        {d.commit}
                      </a>
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
                      {relativeTime(d.timestamp)}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate text-sm">
                      {d.message}
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
