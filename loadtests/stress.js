import http from "k6/http";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

// Stress test: sustained high load to overwhelm the service and trigger alerts
export const options = {
  stages: [
    { duration: "10s", target: 300 },
    { duration: "10s", target: 600 },
    { duration: "10s", target: 1000 },
    { duration: "5m", target: 1000 },  // hold at 1000 for 5 minutes
    { duration: "10s", target: 0 },
  ],
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

  // No sleep — fire as fast as possible
}
