import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public/images/shuleos-logo.svg");
const outDir = path.join(root, "public/icons");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

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
      background: { r: 79, g: 70, b: 229, alpha: 1 },
    },
  })
    .composite([{ input: iconBuffer, top: padding, left: padding }])
    .png()
    .toFile(maskableOut);

  console.log(`Wrote ${path.relative(root, maskableOut)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
