#!/usr/bin/env node
/**
 * Publishes a ready daily feature into the platform owner's in-app inbox.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OWNER_EMAIL,
 *      PREVIEW_URL, PR_URL, PR_NUMBER, RUN_DATE
 * Reads tour-output/manifest-enriched.json (or manifest.json)
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const enriched = join(root, "tour-output", "manifest-enriched.json");
const fallback = join(root, "tour-output", "manifest.json");
const manifestPath = existsSync(enriched) ? enriched : fallback;

async function findOwnerId(supabase, email) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) return null;
    page += 1;
  }
  return null;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const previewUrl = process.env.PREVIEW_URL?.trim();
  const prUrl = process.env.PR_URL?.trim();
  const prNumber = Number(process.env.PR_NUMBER ?? "0");

  if (!url || !key || !ownerEmail || !previewUrl || !prUrl || !prNumber) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OWNER_EMAIL, PREVIEW_URL, PR_URL, PR_NUMBER required"
    );
    process.exit(1);
  }

  if (!existsSync(manifestPath)) {
    console.error("Missing tour manifest at", manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: existingError } = await supabase
    .from("product_releases")
    .select("id, status")
    .eq("pr_number", prNumber)
    .maybeSingle();

  if (existingError) {
    console.error("Could not read product_releases:", existingError.message);
    process.exit(1);
  }

  if (existing && existing.status !== "awaiting") {
    console.log("Release already decided, skipping");
    return;
  }

  const steps = (manifest.steps ?? []).map((step) => ({
    letter: step.letter,
    caption: step.caption,
    screenshotUrl: step.screenshotUrl ?? null,
  }));

  const row = {
    pr_number: prNumber,
    feature_name: manifest.featureName || `Feature PR ${prNumber}`,
    gap_closed: manifest.gapClosed || null,
    feature_key: typeof manifest.featureKey === "string" ? manifest.featureKey : null,
    pr_url: prUrl,
    preview_url: previewUrl,
    video_url: manifest.videoUrl || null,
    steps,
    status: "awaiting",
    updated_at: new Date().toISOString(),
  };

  const { error: saveError } = existing
    ? await supabase.from("product_releases").update(row).eq("id", existing.id)
    : await supabase.from("product_releases").insert(row);

  if (saveError) {
    console.error("Could not save release:", saveError.message);
    process.exit(1);
  }

  if (existing) {
    console.log("Updated awaiting release for PR", prNumber);
    return;
  }

  const ownerId = await findOwnerId(supabase, ownerEmail);
  if (!ownerId) {
    console.error("No auth user for OWNER_EMAIL", ownerEmail);
    process.exit(1);
  }

  const { error: notifyError } = await supabase.from("notifications").insert({
    user_id: ownerId,
    title: `Feature ready: ${row.feature_name}`,
    body: row.gap_closed,
    url: "/admin/releases",
    is_read: false,
  });

  if (notifyError) {
    console.error("Release saved, notification failed:", notifyError.message);
    process.exit(1);
  }

  console.log("In-app release published for", ownerEmail);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
