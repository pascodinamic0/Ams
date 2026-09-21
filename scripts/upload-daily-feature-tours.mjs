#!/usr/bin/env node
/**
 * Upload tour-output/ assets to Supabase Storage bucket daily-feature-tours.
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   TOUR_UPLOAD_PREFIX — e.g. pr-42-run-123
 */

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "tour-output");
const BUCKET = "daily-feature-tours";

function mimeFor(file) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".mp4")) return "video/mp4";
  if (file.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

async function uploadFile(supabase, localPath, storagePath) {
  const body = readFileSync(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, body, {
    contentType: mimeFor(localPath),
    upsert: true,
  });
  if (error) throw new Error(`Upload failed ${storagePath}: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const prefix = process.env.TOUR_UPLOAD_PREFIX;

  if (!url || !key || !prefix) {
    console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TOUR_UPLOAD_PREFIX required");
    process.exit(1);
  }

  const manifestPath = join(outDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("Missing tour-output/manifest.json — run record-feature-tour first");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  for (const step of manifest.steps ?? []) {
    const local = join(outDir, "screenshots", step.screenshotFile);
    if (!existsSync(local)) continue;
    const storagePath = `${prefix}/${step.screenshotFile}`;
    step.screenshotUrl = await uploadFile(supabase, local, storagePath);
  }

  if (manifest.videoFile) {
    const local = join(outDir, "videos", manifest.videoFile);
    if (existsSync(local)) {
      const storagePath = `${prefix}/${manifest.videoFile}`;
      manifest.videoUrl = await uploadFile(supabase, local, storagePath);
    }
  }

  const enrichedPath = join(outDir, "manifest-enriched.json");
  writeFileSync(enrichedPath, JSON.stringify(manifest, null, 2));
  console.log("Uploaded tour assets:", enrichedPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
