import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public/images/shuleos-logo.svg");
const outDir = path.join(root, "public/images/social/posts");

const brand = {
  primary: "#0d9488",
  accent: "#f59e0b",
  dark: "#0c1222",
  product: "ShuleOS",
  tagline: "The operating system for schools",
};

/** @type {Array<{ id: string; filename: string; headline: string[]; solution: string; accent: string }>} */
const posts = [
  {
    id: "fee-chaos",
    filename: "post-01-fee-chaos.png",
    headline: [
      "Still chasing",
      "school fees on",
      "WhatsApp &",
      "spreadsheets?",
    ],
    solution: "M-Pesa payments + auto invoices",
    accent: "#10b981",
  },
  {
    id: "teacher-admin",
    filename: "post-02-teacher-admin.png",
    headline: [
      "Your teachers",
      "spend hours on",
      "admin - not",
      "teaching.",
    ],
    solution: "Attendance, grades & report cards in one place",
    accent: "#3b82f6",
  },
  {
    id: "parent-calls",
    filename: "post-03-parent-calls.png",
    headline: [
      "Parents call",
      "daily asking:",
      "How much do",
      "I owe?",
    ],
    solution: "Real-time fee balances in every parent's pocket",
    accent: "#f43f5e",
  },
  {
    id: "cbc-report-cards",
    filename: "post-04-cbc-report-cards.png",
    headline: [
      "CBC report",
      "cards eating",
      "your entire",
      "weekend?",
    ],
    solution: "CBC-ready gradebooks & auto report cards",
    accent: "#8b5cf6",
  },
  {
    id: "blind-decisions",
    filename: "post-05-blind-decisions.png",
    headline: [
      "Running your",
      "school without",
      "real data?",
    ],
    solution: "Live dashboards for fees, attendance & performance",
    accent: brand.accent,
  },
];

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function createPostSvg(width, height, post, logoDataUri) {
  const pad = Math.round(width * 0.09);
  const headlineSize = Math.round(height * 0.058);
  const lineHeight = Math.round(headlineSize * 1.18);
  const badgeSize = Math.round(height * 0.02);
  const solutionLabelSize = Math.round(height * 0.018);
  const solutionSize = Math.round(height * 0.026);
  const brandSize = Math.round(height * 0.026);

  const badgeY = Math.round(height * 0.14);
  const headlineY = Math.round(height * 0.24);
  const solutionBoxY = Math.round(height * 0.66);
  const solutionLines = wrapLines(post.solution, 34);
  const solutionBoxH =
    solutionLines.length * Math.round(solutionSize * 1.4) + solutionSize + 36;

  const headlineTspans = post.headline
    .map(
      (line, i) =>
        `<tspan x="${pad}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const solutionTspans = solutionLines
    .map(
      (line, i) =>
        `<tspan x="${pad + 24}" dy="${i === 0 ? 0 : Math.round(solutionSize * 1.4)}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const logoSize = 64;
  const logoX = width - pad - logoSize;
  const logoY = height - pad - logoSize - 28;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${brand.dark}"/>
          <stop offset="50%" style="stop-color:#111827"/>
          <stop offset="100%" style="stop-color:#134e4a"/>
        </linearGradient>
        <linearGradient id="accentBar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${post.accent}"/>
          <stop offset="100%" style="stop-color:${brand.primary}"/>
        </linearGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect x="0" y="0" width="${width}" height="5" fill="url(#accentBar)"/>
      <circle cx="${width * 0.9}" cy="${height * 0.1}" r="${width * 0.12}" fill="${post.accent}" opacity="0.1"/>
      <circle cx="${width * 0.08}" cy="${height * 0.88}" r="${width * 0.09}" fill="${brand.primary}" opacity="0.15"/>

      <!-- Problem badge -->
      <rect x="${pad}" y="${badgeY - badgeSize}" width="${Math.round(badgeSize * 8)}" height="${Math.round(badgeSize * 2.4)}" rx="6" fill="${post.accent}" opacity="0.2"/>
      <text x="${pad + 14}" y="${badgeY + badgeSize * 0.5}" font-family="system-ui, -apple-system, sans-serif" font-size="${badgeSize}" font-weight="700" fill="${post.accent}" letter-spacing="2.5">THE PROBLEM</text>

      <!-- Headline -->
      <text x="${pad}" y="${headlineY}" font-family="system-ui, -apple-system, sans-serif" font-size="${headlineSize}" font-weight="800" fill="white" letter-spacing="-1.5">
        ${headlineTspans}
      </text>

      <!-- Solution section -->
      <text x="${pad + 24}" y="${solutionBoxY}" font-family="system-ui, -apple-system, sans-serif" font-size="${solutionLabelSize}" font-weight="700" fill="#64748b" letter-spacing="2">THE SOLUTION</text>
      <rect x="${pad}" y="${solutionBoxY + 12}" width="${width - pad * 2}" height="${solutionBoxH}" rx="16" fill="white" opacity="0.07"/>
      <rect x="${pad}" y="${solutionBoxY + 12}" width="5" height="${solutionBoxH}" rx="2" fill="${brand.primary}"/>
      <text x="${pad + 24}" y="${solutionBoxY + 12 + solutionSize + 16}" font-family="system-ui, -apple-system, sans-serif" font-size="${solutionSize}" font-weight="600" fill="#5eead4">
        ${solutionTspans}
      </text>

      <!-- Footer -->
      <line x1="${pad}" y1="${height - pad - 72}" x2="${width - pad}" y2="${height - pad - 72}" stroke="white" stroke-opacity="0.12"/>
      <text x="${pad}" y="${height - pad - 32}" font-family="system-ui, -apple-system, sans-serif" font-size="${brandSize}" font-weight="700" fill="white">${escapeXml(brand.product)}</text>
      <text x="${pad}" y="${height - pad - 4}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(brandSize * 0.78)}" fill="#94a3b8">${escapeXml(brand.tagline)} | Built in Nairobi</text>
      <image href="${logoDataUri}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}"/>
    </svg>
  `;
}

async function renderPost(post) {
  const width = 1080;
  const height = 1080;
  const logoSvg = await readFile(svgPath);
  const logoPng = await sharp(logoSvg).resize(128, 128).png().toBuffer();
  const logoDataUri = `data:image/png;base64,${logoPng.toString("base64")}`;

  const postSvg = createPostSvg(width, height, post, logoDataUri);
  const out = path.join(outDir, post.filename);
  await sharp(Buffer.from(postSvg)).png().toFile(out);
  return out;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const post of posts) {
    const out = await renderPost(post);
    console.log(`Wrote ${path.relative(root, out)}`);
  }

  console.log(`\nGenerated ${posts.length} marketing post images in public/images/social/posts/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
