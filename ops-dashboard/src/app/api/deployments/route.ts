export const dynamic = "force-dynamic";

const GITHUB_REPO = "AustinWheel/chaos-monkey";

const APPS = [
  { id: "prod-nyc", region: "NYC", env: "prod" },
  { id: "prod-sfo", region: "SFO", env: "prod" },
  { id: "staging", region: "NYC", env: "staging" },
];

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { date: string };
  };
}

interface WorkflowRun {
  id: number;
  head_sha: string;
  head_branch: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  name: string;
}

export async function GET() {
  try {
    // Fetch recent workflow runs (deploy jobs) from GitHub Actions
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ops-dashboard",
    };

    const [runsRes, commitsRes] = await Promise.all([
      fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=20`,
        { headers, cache: "no-store" }
      ),
      fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=10`,
        { headers, cache: "no-store" }
      ),
    ]);

    if (!runsRes.ok || !commitsRes.ok) {
      return Response.json(
        { error: "GitHub API error", runsStatus: runsRes.status, commitsStatus: commitsRes.status },
        { status: 502 }
      );
    }

    const runsData = await runsRes.json();
    const commits: GitHubCommit[] = await commitsRes.json();
    const runs: WorkflowRun[] = runsData.workflow_runs || [];

    // Build a commit lookup for messages
    const commitMap = new Map<string, string>();
    for (const c of commits) {
      commitMap.set(c.sha.slice(0, 7), c.commit.message.split("\n")[0]);
    }

    // Map workflow runs to deployments
    const deployments = [];
    let id = 1;

    for (const run of runs) {
      // Only include runs that are deploy jobs (push to main or staging)
      const isDeployRun =
        run.name === "CI/CD Pipeline" &&
        (run.head_branch === "main" || run.head_branch === "staging");
      if (!isDeployRun) continue;

      const shortSha = run.head_sha.slice(0, 7);
      const message = commitMap.get(shortSha) || "—";

      let status = "building";
      if (run.conclusion === "success") status = "active";
      else if (run.conclusion === "failure") status = "error";
      else if (run.status === "completed" && run.conclusion === "cancelled")
        status = "superseded";

      if (run.head_branch === "main") {
        // Prod deploys go to both regions
        for (const app of APPS.filter((a) => a.env === "prod")) {
          deployments.push({
            id: id++,
            region: app.region,
            env: app.env,
            commit: shortSha,
            status,
            timestamp: run.updated_at || run.created_at,
            message,
            run_id: run.id,
          });
        }
      } else if (run.head_branch === "staging") {
        const app = APPS.find((a) => a.env === "staging")!;
        deployments.push({
          id: id++,
          region: app.region,
          env: app.env,
          commit: shortSha,
          status,
          timestamp: run.updated_at || run.created_at,
          message,
          run_id: run.id,
        });
      }
    }

    // Mark only the latest active deploy per region+env as "active", rest as "superseded"
    const seen = new Set<string>();
    for (const d of deployments) {
      const key = `${d.region}-${d.env}`;
      if (d.status === "active") {
        if (seen.has(key)) {
          d.status = "superseded";
        } else {
          seen.add(key);
        }
      }
    }

    return Response.json(deployments);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to fetch deployments" },
      { status: 500 }
    );
  }
}
