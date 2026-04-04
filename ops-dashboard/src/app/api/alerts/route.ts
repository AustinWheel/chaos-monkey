import { INSTANCES } from "@/lib/config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getInstanceUrl(instanceId?: string | null) {
  const instance = INSTANCES.find((i) => i.id === instanceId) || INSTANCES[0];
  return instance.url;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const instanceId = searchParams.get("instance");
  const baseUrl = getInstanceUrl(instanceId);

  const params = new URLSearchParams();
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  if (status) params.set("status", status);
  if (severity) params.set("severity", severity);

  try {
    const res = await fetch(`${baseUrl}/alerts?${params}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Flask unreachable" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const instanceId = request.nextUrl.searchParams.get("instance");
  const baseUrl = getInstanceUrl(instanceId);
  const body = await request.json();

  try {
    const res = await fetch(`${baseUrl}/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Flask unreachable" },
      { status: 502 }
    );
  }
}
