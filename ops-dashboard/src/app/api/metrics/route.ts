import { INSTANCES } from "@/lib/config";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const instanceId = request.nextUrl.searchParams.get("instance");
  const instance = INSTANCES.find((i) => i.id === instanceId) || INSTANCES[0];

  try {
    const res = await fetch(`${instance.url}/metrics`, { cache: "no-store" });
    const data = await res.json();
    return Response.json({ instance: instance.id, ...data });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Flask unreachable" },
      { status: 502 }
    );
  }
}
