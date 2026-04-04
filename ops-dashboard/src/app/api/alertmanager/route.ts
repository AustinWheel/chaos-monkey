import { ALERTMANAGER_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${ALERTMANAGER_URL}/api/v2/alerts`, {
      cache: "no-store",
    });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "AlertManager unreachable" },
      { status: 502 }
    );
  }
}
