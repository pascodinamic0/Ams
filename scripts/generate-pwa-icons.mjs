import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public/images/shuleos-logo.svg");
const outDir = path.join(root, "public/icons");
const faviconPath = path.join(root, "app/favicon.ico");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Teal primary #0d9488
const maskableBackground = { r: 13, g: 148, b: 136, alpha: 1 };

async function main() {
  await mkdir(outDir, { recursive: true });
  const svg = await readFile(svgPath);

  for (const size of sizes) {
    const out = path.join(outDir, `icon-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log(`Wrote ${path.relative(root, out)}`);
  }

  const maskableSize = 512;
  const maskableOut = path.join(outDir, "maskable-icon-512x512.png");
  const iconSize = Math.round(maskableSize * 0.72);
  const padding = Math.round((maskableSize - iconSize) / 2);
  const iconBuffer = await sharp(svg).resize(iconSize, iconSize).png().toBuffer();

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: maskableBackground,
    },
  })
    .composite([{ input: iconBuffer, top: padding, left: padding }])
    .png()
    .toFile(maskableOut);

  console.log(`Wrote ${path.relative(root, maskableOut)}`);

  await sharp(svg).resize(32, 32).png().toFile(faviconPath);
  console.log(`Wrote ${path.relative(root, faviconPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
