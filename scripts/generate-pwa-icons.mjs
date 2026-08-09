import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const faviconSvgPath = path.join(root, "public/images/shuleos-favicon.svg");
const outDir = path.join(root, "public/icons");
const faviconPath = path.join(root, "app/favicon.ico");
const appIconPath = path.join(root, "app/icon.png");

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

// Soft off-white so the dark-teal mark stays crisp on home screens
const iconBackground = { r: 255, g: 255, b: 255, alpha: 1 };
const maskableBackground = { r: 255, g: 255, b: 255, alpha: 1 };

async function renderIcon(svg, size, paddingRatio = 0.12) {
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const pad = Math.round((size - inner) / 2);
  const mark = await sharp(svg).resize(inner, inner).png().toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: iconBackground,
    },
  })
    .composite([{ input: mark, top: pad, left: pad }])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const faviconSvg = await readFile(faviconSvgPath);

  for (const size of sizes) {
    const out = path.join(outDir, `icon-${size}x${size}.png`);
    const buffer = await renderIcon(faviconSvg, size, size <= 96 ? 0.1 : 0.12);
    await sharp(buffer).toFile(out);
    console.log(`Wrote ${path.relative(root, out)}`);
  }

  const maskableSize = 512;
  const maskableOut = path.join(outDir, "maskable-icon-512x512.png");
  const iconSize = Math.round(maskableSize * 0.68);
  const padding = Math.round((maskableSize - iconSize) / 2);
  const iconBuffer = await sharp(faviconSvg).resize(iconSize, iconSize).png().toBuffer();

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

  // Favicon + Next.js app/icon — bannerless mark, crisp at 32px
  for (const [out, size] of [
    [faviconPath, 32],
    [appIconPath, 32],
  ]) {
    const buffer = await renderIcon(faviconSvg, size, 0.08);
    await sharp(buffer).toFile(out);
    console.log(`Wrote ${path.relative(root, out)}`);
  }

  // Keep a high-res mark source for future regenerations
  const markSource = path.join(root, "scripts/assets/shuleos-favicon-source.png");
  await mkdir(path.dirname(markSource), { recursive: true });
  await sharp(faviconSvg).resize(512, 512).png().toFile(markSource);
  console.log(`Wrote ${path.relative(root, markSource)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
