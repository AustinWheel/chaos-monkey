export interface PrometheusResult {
  metric: Record<string, string>;
  values: [number, string][];
}

export interface PrometheusResponse {
  status: string;
  data: {
    resultType: string;
    result: PrometheusResult[];
  };
}

export interface ChartDataPoint {
  time: number;
  [key: string]: number;
}

export function parsePrometheusResponse(
  response: PrometheusResponse,
  labelKey = "job"
): ChartDataPoint[] {
  if (!response?.data?.result?.length) return [];

  const timeMap = new Map<number, ChartDataPoint>();

  for (const series of response.data.result) {
    const label = series.metric[labelKey] || series.metric.quantile || "value";
    for (const [ts, val] of series.values) {
      const time = ts * 1000;
      const point = timeMap.get(time) || { time };
      point[label] = parseFloat(val);
      timeMap.set(time, point);
    }
  }

  return Array.from(timeMap.values()).sort((a, b) => a.time - b.time);
}

export function buildQueryParams(
  query: string,
  range: string
): URLSearchParams {
  const now = Math.floor(Date.now() / 1000);
  const rangeMap: Record<string, number> = {
    "15m": 15 * 60,
    "1h": 3600,
    "6h": 6 * 3600,
    "24h": 24 * 3600,
  };
  const duration = rangeMap[range] || 3600;
  const step = Math.max(Math.floor(duration / 100), 15);

  return new URLSearchParams({
    query,
    start: String(now - duration),
    end: String(now),
    step: String(step),
  });
}
