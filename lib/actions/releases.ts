"use server";

import { revalidatePath } from "next/cache";
import { actionError } from "@/lib/i18n/action-error";
import { getCurrentProfile } from "@/lib/auth/session";
import { isPlatformOwner } from "@/lib/features/owner";
import { createAdminClient } from "@/lib/supabase/admin";
import { closePullRequest, mergePullRequest } from "@/lib/github/merge-pull-request";
import type { SupabaseClient } from "@supabase/supabase-js";

async function requireOwnerClient(): Promise<
  { admin: SupabaseClient } | { error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile || !isPlatformOwner(profile.email, profile.role)) {
    return await actionError("notAuthorizedManageFeatures");
  }
  const admin = createAdminClient();
  if (!admin) {
    return await actionError("serverConfig");
  }
  return { admin };
}

function refreshReleaseViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/releases");
  revalidatePath("/admin/features");
}

export async function approveRelease(releaseId: string) {
  const gate = await requireOwnerClient();
  if ("error" in gate) return gate;

  const { data: release, error: loadError } = await gate.admin
    .from("product_releases")
    .select("id, pr_number, feature_name, status")
    .eq("id", releaseId)
    .maybeSingle();

  if (loadError || !release) {
    return await actionError("releaseNotFound");
  }
  if (release.status !== "awaiting") {
    return await actionError("releaseAlreadyDecided");
  }

  const merged = await mergePullRequest(
    release.pr_number,
    release.feature_name
  );
  if (merged.error === "missing_token") {
    return await actionError("mergeTokenMissing");
  }
  if (merged.error) {
    return { error: merged.error };
  }

  const { error: updateError } = await gate.admin
    .from("product_releases")
    .update({
      status: "approved",
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", releaseId);

  if (updateError) return { error: updateError.message };

  refreshReleaseViews();
  return {} as { error?: string };
}

export async function dismissRelease(releaseId: string) {
  const gate = await requireOwnerClient();
  if ("error" in gate) return gate;

  const { data: release, error: loadError } = await gate.admin
    .from("product_releases")
    .select("id, pr_number, status")
    .eq("id", releaseId)
    .maybeSingle();

  if (loadError || !release) {
    return await actionError("releaseNotFound");
  }
  if (release.status !== "awaiting") {
    return await actionError("releaseAlreadyDecided");
  }

  const closed = await closePullRequest(release.pr_number);
  if (closed.error && closed.error !== "missing_token") {
    return { error: closed.error };
  }

  const { error: updateError } = await gate.admin
    .from("product_releases")
    .update({
      status: "dismissed",
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", releaseId);

  if (updateError) return { error: updateError.message };

  refreshReleaseViews();
  return {
    warning: closed.error === "missing_token" ? "pr_left_open" : undefined,
  } as { error?: string; warning?: string };
}
