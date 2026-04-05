import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

// Stress test: ramp to 1000 users to intentionally overwhelm the service
export const options = {
  stages: [
    { duration: "15s", target: 500 },   // ramp to 500
    { duration: "15s", target: 1000 },  // ramp to 1000
    { duration: "30s", target: 1000 },  // hold at 1000
    { duration: "15s", target: 0 },     // ramp down
  ],
  // No thresholds — we expect this to fail
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  let res = http.get(`${BASE_URL}/health`);
  errorRate.add(res.status !== 200);

  res = http.get(`${BASE_URL}/products`);
  errorRate.add(res.status !== 200);

  res = http.get(`${BASE_URL}/users?page=1&per_page=10`);
  errorRate.add(res.status !== 200);

  res = http.get(`${BASE_URL}/urls`);
  errorRate.add(res.status !== 200);

  sleep(0.2);
}
