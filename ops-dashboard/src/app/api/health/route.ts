import { INSTANCES } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = await Promise.allSettled(
    INSTANCES.map(async (instance) => {
      const start = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(`${instance.url}/health`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const latencyMs = Date.now() - start;
        const data = await res.json();
        return {
          instanceId: instance.id,
          name: instance.name,
          region: instance.region,
          env: instance.env,
          status: res.ok ? data.status || "ok" : "down",
          data,
          latencyMs,
          error: null,
        };
      } catch (err) {
        return {
          instanceId: instance.id,
          name: instance.name,
          region: instance.region,
          env: instance.env,
          status: "down",
          data: null,
          latencyMs: Date.now() - start,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  const instances = results.map((r) =>
    r.status === "fulfilled" ? r.value : r.reason
  );

  return Response.json(instances);
}
