import { LOKI_URL } from "@/lib/config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query");
  const limit = searchParams.get("limit") || "100";
  const direction = searchParams.get("direction") || "backward";

  if (!query) {
    return Response.json({ error: "query parameter required" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const start = searchParams.get("start") || String(now - 3600);
  const end = searchParams.get("end") || String(now);

  const params = new URLSearchParams({
    query,
    start: `${start}000000000`,
    end: `${end}000000000`,
    limit,
    direction,
  });

  try {
    const res = await fetch(
      `${LOKI_URL}/loki/api/v1/query_range?${params}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Loki unreachable" },
      { status: 502 }
    );
  }
}
