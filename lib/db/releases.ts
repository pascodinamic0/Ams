import { createClient } from "@/lib/supabase/server";

export type ReleaseStep = {
  letter: string;
  caption: string;
  screenshotUrl?: string | null;
};

export type ReleaseStatus = "awaiting" | "approved" | "dismissed";

export type ProductRelease = {
  id: string;
  pr_number: number;
  feature_name: string;
  gap_closed: string | null;
  feature_key: string | null;
  pr_url: string;
  preview_url: string | null;
  video_url: string | null;
  steps: ReleaseStep[];
  status: ReleaseStatus;
  created_at: string;
  decided_at: string | null;
};

function asSteps(value: unknown): ReleaseStep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((step) => {
    if (!step || typeof step !== "object") return [];
    const row = step as Record<string, unknown>;
    const letter = typeof row.letter === "string" ? row.letter : "";
    const caption = typeof row.caption === "string" ? row.caption : "";
    if (!letter && !caption) return [];
    const screenshotUrl =
      typeof row.screenshotUrl === "string"
        ? row.screenshotUrl
        : typeof row.screenshot_url === "string"
          ? row.screenshot_url
          : null;
    return [{ letter, caption, screenshotUrl }];
  });
}

function mapRelease(row: Record<string, unknown>): ProductRelease {
  const status = row.status;
  return {
    id: String(row.id),
    pr_number: Number(row.pr_number),
    feature_name: String(row.feature_name ?? ""),
    gap_closed: typeof row.gap_closed === "string" ? row.gap_closed : null,
    feature_key: typeof row.feature_key === "string" ? row.feature_key : null,
    pr_url: String(row.pr_url ?? ""),
    preview_url: typeof row.preview_url === "string" ? row.preview_url : null,
    video_url: typeof row.video_url === "string" ? row.video_url : null,
    steps: asSteps(row.steps),
    status:
      status === "approved" || status === "dismissed" || status === "awaiting"
        ? status
        : "awaiting",
    created_at: String(row.created_at ?? ""),
    decided_at: typeof row.decided_at === "string" ? row.decided_at : null,
  };
}

const RELEASE_COLUMNS =
  "id, pr_number, feature_name, gap_closed, feature_key, pr_url, preview_url, video_url, steps, status, created_at, decided_at";

export async function getProductReleases(): Promise<ProductRelease[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_releases")
    .select(RELEASE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("getProductReleases error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapRelease(row as Record<string, unknown>));
}

export async function getAwaitingReleases(): Promise<ProductRelease[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_releases")
    .select(RELEASE_COLUMNS)
    .eq("status", "awaiting")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAwaitingReleases error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapRelease(row as Record<string, unknown>));
}
