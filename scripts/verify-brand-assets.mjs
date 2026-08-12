import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const requiredPngs = [
  ["public/images/shuleos-mark.png", 512],
  ["public/icons/icon-72x72.png", 72],
  ["public/icons/icon-96x96.png", 96],
  ["public/icons/icon-128x128.png", 128],
  ["public/icons/icon-144x144.png", 144],
  ["public/icons/icon-152x152.png", 152],
  ["public/icons/icon-180x180.png", 180],
  ["public/icons/icon-192x192.png", 192],
  ["public/icons/icon-384x384.png", 384],
  ["public/icons/icon-512x512.png", 512],
  ["public/icons/maskable-icon-512x512.png", 512],
  ["app/icon.png", 192],
  ["app/apple-icon.png", 180],
  ["public/apple-touch-icon.png", 180],
];

const requiredTextMatches = [
  ["lib/pwa/assets.ts", 'export const pwaAssetRevision = "'],
  ["lib/pwa/config.ts", "src: pwaIconPath(size)"],
  ["lib/pwa/config.ts", "src: pwaMaskableIconPath"],
  ["app/layout.tsx", "pwaIconPath(192)"],
  ["app/layout.tsx", "pwaAppleTouchIconPath"],
  ["app/sw.ts", "pwaIconPath(192)"],
  ["app/sw.ts", "pwaIconPath(96)"],
  ["components/company/brand-logo-mark.tsx", "brandMarkPath"],
];

async function main() {
  for (const [relative, expected] of requiredPngs) {
    const filePath = path.join(root, relative);
    const meta = await sharp(filePath).metadata();
    if (meta.width !== expected || meta.height !== expected) {
      throw new Error(`${relative} is ${meta.width}x${meta.height}, expected ${expected}x${expected}`);
    }

    const { size } = await stat(filePath);
    if (size < 400) throw new Error(`${relative} looks empty (${size} bytes)`);

    const { data } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const topLeft = [data[0], data[1], data[2]];
    const whiteCorner = topLeft[0] > 240 && topLeft[1] > 240 && topLeft[2] > 240;
    if (!whiteCorner) {
      throw new Error(
        `${relative} top-left pixel is ${topLeft.join(",")} — expected a white canvas for the new lockup`
      );
    }
  }

  for (const [relative, snippet] of requiredTextMatches) {
    const text = await readFile(path.join(root, relative), "utf8");
    if (!text.includes(snippet)) {
      throw new Error(`${relative} is missing required wiring: ${snippet}`);
    }
  }

  const assets = await readFile(path.join(root, "lib/pwa/assets.ts"), "utf8");
  const revision = assets.match(/pwaAssetRevision = "([^"]+)"/)?.[1];
  if (!revision) throw new Error("Could not read pwaAssetRevision");

  const config = await readFile(path.join(root, "lib/pwa/config.ts"), "utf8");
  if (!config.includes("pwaIconPath") || !config.includes("pwaMaskableIconPath")) {
    throw new Error("PWA manifest is not using versioned icon URLs");
  }

  console.log(`Brand assets OK (revision ${revision})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
