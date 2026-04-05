import { INSTANCES } from "@/lib/config";

export const dynamic = "force-dynamic";

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  // Try each instance until one responds
  for (const instance of INSTANCES) {
    try {
      const res = await fetchWithTimeout(`${instance.url}/loadtest/results`);
      if (res.ok) {
        const data = await res.json();
        return Response.json(data);
      }
    } catch {
      // Try next instance
    }
  }
  return Response.json([]);
}
