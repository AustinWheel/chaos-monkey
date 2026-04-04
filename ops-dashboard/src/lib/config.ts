export const INSTANCES = [
  {
    id: "prod-nyc",
    name: "Prod NYC",
    url: "https://pe-hackathon-muy5v.ondigitalocean.app",
    region: "nyc",
    env: "prod",
  },
  {
    id: "prod-sfo",
    name: "Prod SFO",
    url: "https://pe-hackathon-prod-sfo-wkpqr.ondigitalocean.app",
    region: "sfo",
    env: "prod",
  },
  {
    id: "staging",
    name: "Staging",
    url: "https://pe-hackathon-staging-f28oj.ondigitalocean.app",
    region: "nyc",
    env: "staging",
  },
] as const;

export type Instance = (typeof INSTANCES)[number];

export const PROMETHEUS_URL = "http://143.198.173.164:9090";
export const LOKI_URL = "http://143.198.173.164:3100";
export const ALERTMANAGER_URL = "http://143.198.173.164:9093";
