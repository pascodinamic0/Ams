#!/usr/bin/env node
/**
 * Records a feature tour against a Vercel preview URL.
 * Reads feature-tour.json from cwd. Writes tour-output/manifest.json + PNGs + video.
 *
 * Env:
 *   PREVIEW_URL � base URL (no trailing slash)
 *   DAILY_TOUR_LOGIN_EMAIL / DAILY_TOUR_LOGIN_PASSWORD � optional login substitution
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "tour-output");

function loadTour() {
  const tourPath = join(root, "feature-tour.json");
  if (!existsSync(tourPath)) {
    console.error("Missing feature-tour.json at repo root");
    process.exit(1);
  }
  return JSON.parse(readFileSync(tourPath, "utf8"));
}

function substituteSecrets(value) {
  if (typeof value !== "string") return value;
  return value
    .replace("__DAILY_TOUR_LOGIN_EMAIL__", process.env.DAILY_TOUR_LOGIN_EMAIL ?? "")
    .replace("__DAILY_TOUR_LOGIN_PASSWORD__", process.env.DAILY_TOUR_LOGIN_PASSWORD ?? "");
}

async function runActions(page, actions = []) {
  for (const action of actions) {
    switch (action.type) {
      case "wait":
        await page.waitForTimeout(action.ms ?? 500);
        break;
      case "click":
        await page.click(action.selector, { timeout: 15000 });
        break;
      case "fill":
        await page.fill(action.selector, substituteSecrets(action.value ?? ""));
        break;
      case "press":
        await page.keyboard.press(action.key ?? "Enter");
        break;
      default:
        console.warn("Unknown action type:", action.type);
    }
  }
}

async function main() {
  const previewUrl = process.env.PREVIEW_URL?.replace(/\/$/, "");
  if (!previewUrl) {
    console.error("PREVIEW_URL is required");
    process.exit(1);
  }

  const tour = loadTour();
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, "screenshots"), { recursive: true });
  mkdirSync(join(outDir, "videos"), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: join(outDir, "videos"),
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();

  const manifest = {
    featureName: tour.featureName,
    gapClosed: tour.gapClosed,
    steps: [],
  };

  for (const step of tour.steps ?? []) {
    const path = step.path.startsWith("/") ? step.path : `/${step.path}`;
    const url = `${previewUrl}${path}`;
    console.log(`Tour step ${step.letter}: ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await runActions(page, step.actions);

    const slug = String(step.letter ?? manifest.steps.length + 1)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const screenshotFile = `step-${slug}.png`;
    const screenshotPath = join(outDir, "screenshots", screenshotFile);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    manifest.steps.push({
      letter: step.letter ?? String.fromCharCode(65 + manifest.steps.length),
      caption: step.caption,
      screenshotFile,
    });
  }

  await context.close();
  await browser.close();

  // Playwright names video files opaquely � pick the newest mp4/webm
  const videoDir = join(outDir, "videos");
  let videoFile = null;
  if (existsSync(videoDir)) {
    const { readdirSync, statSync } = await import("node:fs");
    const candidates = readdirSync(videoDir)
      .filter((f) => f.endsWith(".webm") || f.endsWith(".mp4"))
      .map((f) => ({ f, m: statSync(join(videoDir, f)).mtimeMs }))
      .sort((a, b) => b.m - a.m);
    if (candidates[0]) videoFile = candidates[0].f;
  }

  writeFileSync(
    join(outDir, "manifest.json"),
    JSON.stringify({ ...manifest, videoFile }, null, 2)
  );
  console.log("Tour recorded:", join(outDir, "manifest.json"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
