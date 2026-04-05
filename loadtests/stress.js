import http from "k6/http";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

// Stress test: massive concurrent load to overwhelm the service
export const options = {
  stages: [
    { duration: "10s", target: 1000 },
    { duration: "10s", target: 3000 },
    { duration: "10s", target: 5000 },
    { duration: "5m", target: 5000 },   // hold 5000 VUs for 5 minutes
    { duration: "10s", target: 0 },
  ],
  batch: 4,          // send all 4 requests per iteration in parallel
  batchPerHost: 4,
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  // Fire all requests in a batch — no waiting between them
  http.batch([
    ["GET", `${BASE_URL}/health`],
    ["GET", `${BASE_URL}/products`],
    ["GET", `${BASE_URL}/users?page=1&per_page=10`],
    ["GET", `${BASE_URL}/urls`],
    ["GET", `${BASE_URL}/health`],
    ["GET", `${BASE_URL}/products`],
    ["GET", `${BASE_URL}/users?page=1&per_page=10`],
    ["GET", `${BASE_URL}/urls`],
  ]);

  // No sleep — every VU fires 8 requests per iteration as fast as possible
}
