import { INSTANCES } from "@/lib/config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CHAOS_ACTIONS: Record<string, string> = {
  error: "/chaos/error",
  "error-flood": "/chaos/error-flood",
  cpu: "/chaos/cpu",
  latency: "/chaos/latency",
  "health-fail": "/chaos/health-fail",
  critical: "/chaos/critical",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, target, ...actionParams } = body as {
    action: string;
    target: string;
    [key: string]: string | number;
  };

  const instance = INSTANCES.find((i) => i.id === target);
  if (!instance) {
    return Response.json({ error: "Invalid target instance" }, { status: 400 });
  }

  const path = CHAOS_ACTIONS[action];
  if (!path) {
    return Response.json({ error: "Invalid chaos action" }, { status: 400 });
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(actionParams)) {
    if (v !== undefined && v !== null && v !== "") {
      params.set(k, String(v));
    }
  }

  const url = `${instance.url}${path}${params.toString() ? `?${params}` : ""}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return Response.json({
      action,
      target: instance.id,
      url,
      status: res.status,
      response: data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json(
      {
        action,
        target: instance.id,
        url,
        error: err instanceof Error ? err.message : "Request failed",
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
