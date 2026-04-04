export interface LokiStream {
  stream: Record<string, string>;
  values: [string, string][];
}

export interface LokiResponse {
  status: string;
  data: {
    resultType: string;
    result: LokiStream[];
  };
}

export interface LogEntry {
  timestamp: Date;
  nanoseconds: string;
  level: string;
  message: string;
  raw: string;
  labels: Record<string, string>;
  parsed: Record<string, unknown> | null;
}

export function parseLokiResponse(response: LokiResponse): LogEntry[] {
  if (!response?.data?.result?.length) return [];

  const entries: LogEntry[] = [];

  for (const stream of response.data.result) {
    for (const [ns, line] of stream.values) {
      let parsed: Record<string, unknown> | null = null;
      let level = "INFO";
      let message = line;

      try {
        parsed = JSON.parse(line);
        level = (parsed?.level as string) || (parsed?.levelname as string) || "INFO";
        message = (parsed?.message as string) || line;
      } catch {
        // plain text log
      }

      entries.push({
        timestamp: new Date(parseInt(ns) / 1_000_000),
        nanoseconds: ns,
        level: level.toUpperCase(),
        message,
        raw: line,
        labels: stream.stream,
        parsed,
      });
    }
  }

  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function buildLogQuery(filters: {
  region?: string;
  environment?: string;
  level?: string;
  search?: string;
}): string {
  const labelParts = ['job="flask-app"'];
  if (filters.region && filters.region !== "all") {
    labelParts.push(`region="${filters.region}"`);
  }
  if (filters.environment && filters.environment !== "all") {
    labelParts.push(`environment="${filters.environment}"`);
  }

  let query = `{${labelParts.join(", ")}}`;

  if (filters.search) {
    query += ` |= \`${filters.search}\``;
  }

  if (filters.level && filters.level !== "all") {
    query += ` | json | level=~\`(?i)${filters.level}\``;
  }

  return query;
}
