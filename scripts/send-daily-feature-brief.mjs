#!/usr/bin/env node
/**
 * Sends the daily feature brief email after CI tour upload.
 *
 * Env: RESEND_API_KEY, RESEND_FROM (optional), OWNER_EMAIL, PREVIEW_URL, PR_URL, PR_NUMBER, RUN_DATE
 * Reads tour-output/manifest-enriched.json (or manifest.json)
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";
import {
  buildDailyFeatureBriefHtml,
  buildDailyFeatureBriefText,
} from "./lib/daily-feature-email.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const enriched = join(root, "tour-output", "manifest-enriched.json");
const fallback = join(root, "tour-output", "manifest.json");
const manifestPath = existsSync(enriched) ? enriched : fallback;

async function main() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.OWNER_EMAIL?.trim();
  const previewUrl = process.env.PREVIEW_URL?.trim();
  const prUrl = process.env.PR_URL?.trim();
  const prNumber = Number(process.env.PR_NUMBER ?? "0");
  const runDate = process.env.RUN_DATE ?? new Date().toISOString().slice(0, 10);
  const from =
    process.env.RESEND_FROM?.trim() || "ShuleOS <onboarding@resend.dev>";

  if (!apiKey || !to || !previewUrl || !prUrl || !prNumber) {
    console.error("RESEND_API_KEY, OWNER_EMAIL, PREVIEW_URL, PR_URL, PR_NUMBER required");
    process.exit(1);
  }

  if (!existsSync(manifestPath)) {
    console.error("Missing tour manifest at", manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  const input = {
    featureName: manifest.featureName,
    gapClosed: manifest.gapClosed,
    prUrl,
    previewUrl,
    videoUrl: manifest.videoUrl,
    steps: (manifest.steps ?? []).map((s) => ({
      letter: s.letter,
      caption: s.caption,
      screenshotUrl: s.screenshotUrl,
    })),
  };

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to,
      subject: `ShuleOS — feature ready to go live: ${input.featureName}`,
      html: buildDailyFeatureBriefHtml(input),
      text: buildDailyFeatureBriefText(input),
    },
    { idempotencyKey: `daily-feature-brief/${runDate}/pr-${prNumber}` }
  );

  if (error) {
    console.error("Email failed:", error.message);
    process.exit(1);
  }

  console.log("Daily feature brief sent:", data?.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
