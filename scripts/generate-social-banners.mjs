import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public/images/shuleos-logo.svg");
const outDir = path.join(root, "public/images/social");

const brand = {
  primary: "#0d9488",
  accent: "#f59e0b",
  dark: "#0c1222",
  light: "#fafaf9",
  tagline: "The operating system for schools",
  product: "ShuleOS",
};

async function createGradientBackground(width, height) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f766e"/>
          <stop offset="50%" style="stop-color:#0d9488"/>
          <stop offset="100%" style="stop-color:#115e59"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${Math.min(width, height) * 0.12}" fill="#f59e0b" opacity="0.3"/>
      <circle cx="${width * 0.1}" cy="${height * 0.85}" r="${Math.min(width, height) * 0.08}" fill="#f59e0b" opacity="0.15"/>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createTextOverlay(width, height, title, subtitle) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width * 0.08}" y="${height * 0.55}" font-family="system-ui, sans-serif" font-size="${Math.round(height * 0.08)}" font-weight="800" fill="white">${title}</text>
      <text x="${width * 0.08}" y="${height * 0.65}" font-family="system-ui, sans-serif" font-size="${Math.round(height * 0.035)}" fill="rgba(255,255,255,0.85)">${subtitle}</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

const banners = [
  { name: "shuleos-social-square-brand.png", width: 1080, height: 1080, logoSize: 180 },
  { name: "shuleos-social-linkedin-banner.png", width: 1584, height: 396, logoSize: 120 },
  { name: "shuleos-social-twitter-header.png", width: 1500, height: 500, logoSize: 140 },
  { name: "shuleos-social-story.png", width: 1080, height: 1920, logoSize: 200 },
  { name: "shuleos-social-mpesa-feature.png", width: 1200, height: 630, logoSize: 140 },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const logoSvg = await readFile(svgPath);

  for (const banner of banners) {
    const bg = await createGradientBackground(banner.width, banner.height);
    const logo = await sharp(logoSvg)
      .resize(banner.logoSize, banner.logoSize)
      .png()
      .toBuffer();

    const logoLeft = Math.round(banner.width * 0.08);
    const logoTop = Math.round(banner.height * 0.12);

    const textOverlay = await createTextOverlay(
      banner.width,
      banner.height,
      brand.product,
      brand.tagline
    );

    const out = path.join(outDir, banner.name);
    await sharp(bg)
      .composite([
        { input: logo, top: logoTop, left: logoLeft },
        { input: textOverlay, top: 0, left: 0 },
      ])
      .png()
      .toFile(out);

    console.log(`Wrote ${path.relative(root, out)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
