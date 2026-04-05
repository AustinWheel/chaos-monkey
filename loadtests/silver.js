import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const healthLatency = new Trend("health_latency", true);
const productsLatency = new Trend("products_latency", true);
const usersLatency = new Trend("users_latency", true);
const urlsLatency = new Trend("urls_latency", true);

// Silver: 200 concurrent users, response times must stay under 3 seconds
export const options = {
  stages: [
    { duration: "15s", target: 200 }, // ramp up to 200 users
    { duration: "30s", target: 200 }, // hold at 200 users
    { duration: "15s", target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"], // p95 under 3 seconds
    errors: ["rate<0.05"],             // error rate under 5%
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  // GET /health
  let res = http.get(`${BASE_URL}/health`);
  healthLatency.add(res.timings.duration);
  check(res, { "health 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // GET /products
  res = http.get(`${BASE_URL}/products`);
  productsLatency.add(res.timings.duration);
  check(res, { "products 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // GET /users (paginated)
  res = http.get(`${BASE_URL}/users?page=1&per_page=10`);
  usersLatency.add(res.timings.duration);
  check(res, { "users 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // GET /urls
  res = http.get(`${BASE_URL}/urls`);
  urlsLatency.add(res.timings.duration);
  check(res, { "urls 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  // GET /metrics
  res = http.get(`${BASE_URL}/metrics`);
  check(res, { "metrics 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.5);
}

export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.["p(95)"] || 0;
  const reqRate = data.metrics.http_reqs?.values?.rate || 0;
  const errRate = (data.metrics.errors?.values?.rate || 0) * 100;
  const passed = p95 < 3000 && errRate < 5;

  const payload = JSON.stringify({
    tier: "silver",
    target: BASE_URL.includes("staging") ? "staging" : "prod",
    req_per_sec: reqRate,
    p95_ms: p95,
    error_rate: errRate,
    status: passed ? "passed" : "failed",
    vus: 200,
    duration: "30s",
  });

  http.post(`${BASE_URL}/loadtest/results`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return {};
}
