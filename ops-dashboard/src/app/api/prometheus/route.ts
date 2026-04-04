import { PROMETHEUS_URL } from "@/lib/config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const step = searchParams.get("step");

  if (!query) {
    return Response.json({ error: "query parameter required" }, { status: 400 });
  }

  const params = new URLSearchParams({ query });
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  if (step) params.set("step", step);

  try {
    const res = await fetch(
      `${PROMETHEUS_URL}/api/v1/query_range?${params}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Prometheus unreachable" },
      { status: 502 }
    );
  }
}
