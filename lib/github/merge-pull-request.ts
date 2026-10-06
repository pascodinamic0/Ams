const DEFAULT_REPO = "pascodinamic0/Ams";

type GithubPull = {
  draft?: boolean;
  merged?: boolean;
  state?: string;
  html_url?: string;
  title?: string;
};

function repoSlug(): string {
  return process.env.GITHUB_REPOSITORY?.trim() || DEFAULT_REPO;
}

function token(): string | null {
  return process.env.GITHUB_MERGE_TOKEN?.trim() || null;
}

async function github<T>(path: string, init?: RequestInit): Promise<{ data?: T; error?: string; status: number }> {
  const auth = token();
  if (!auth) return { status: 0, error: "missing_token" };

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${auth}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let body: T | { message?: string } | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as T;
    } catch {
      body = { message: text.slice(0, 300) };
    }
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body && body.message
        ? String(body.message)
        : `GitHub returned ${response.status}`;
    return { status: response.status, error: message };
  }

  return { status: response.status, data: body as T };
}

export function githubMergeConfigured(): boolean {
  return Boolean(token());
}

/** Mark a draft ready, then squash-merge it into the default branch. */
export async function mergePullRequest(
  prNumber: number,
  commitTitle: string
): Promise<{ error?: string; alreadyMerged?: boolean }> {
  if (!token()) return { error: "missing_token" };

  const repo = repoSlug();
  const pullPath = `/repos/${repo}/pulls/${prNumber}`;
  const existing = await github<GithubPull>(pullPath);
  if (existing.error) return { error: existing.error };
  if (existing.data?.merged) return { alreadyMerged: true };

  if (existing.data?.draft) {
    const ready = await github(pullPath, {
      method: "PATCH",
      body: JSON.stringify({ draft: false }),
    });
    if (ready.error) return { error: ready.error };
  }

  const merged = await github<{ merged?: boolean }>(`${pullPath}/merge`, {
    method: "PUT",
    body: JSON.stringify({
      merge_method: "squash",
      commit_title: commitTitle,
    }),
  });

  if (merged.error) return { error: merged.error };
  return {};
}

export async function closePullRequest(prNumber: number): Promise<{ error?: string }> {
  if (!token()) return { error: "missing_token" };

  const repo = repoSlug();
  const closed = await github(`/repos/${repo}/pulls/${prNumber}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
  if (closed.error) return { error: closed.error };
  return {};
}
