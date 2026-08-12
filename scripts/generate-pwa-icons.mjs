import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public/images/shuleos-logo.png");
const outDir = path.join(root, "public/icons");
const markPath = path.join(root, "public/images/shuleos-mark.png");
const faviconPath = path.join(root, "app/favicon.ico");
const appIconPath = path.join(root, "app/icon.png");
const appleIconPath = path.join(root, "app/apple-icon.png");
const appleTouchPath = path.join(root, "public/apple-touch-icon.png");

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const white = { r: 255, g: 255, b: 255, alpha: 1 };

function isNearWhite(r, g, b) {
  return r > 245 && g > 245 && b > 245;
}

/**
 * Crop the stacked lockup to the emblem (book + orbit + star) above the wordmark.
 */
async function extractEmblem(sourcePath) {
  const image = sharp(sourcePath);
  const { width, height } = await image.metadata();
  if (!width || !height) {
    throw new Error(`Could not read dimensions for ${sourcePath}`);
  }

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const rowHasContent = Array.from({ length: height }, (_, y) => {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      if (!isNearWhite(data[i], data[i + 1], data[i + 2])) return true;
    }
    return false;
  });

  const firstRow = rowHasContent.findIndex(Boolean);
  if (firstRow < 0) {
    throw new Error("Logo source is empty (no non-white pixels)");
  }

  let gapStart = null;
  let emblemEnd = height - 1;
  for (let y = firstRow; y < height; y += 1) {
    if (!rowHasContent[y]) {
      if (gapStart === null) gapStart = y;
    } else if (gapStart !== null) {
      if (y - gapStart >= 20) {
        emblemEnd = gapStart - 1;
        break;
      }
      gapStart = null;
    }
  }

  let firstCol = width;
  let lastCol = 0;
  for (let y = firstRow; y <= emblemEnd; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels;
      if (!isNearWhite(data[i], data[i + 1], data[i + 2])) {
        if (x < firstCol) firstCol = x;
        if (x > lastCol) lastCol = x;
      }
    }
  }

  const pad = 8;
  const left = Math.max(0, firstCol - pad);
  const top = Math.max(0, firstRow - pad);
  const cropWidth = Math.min(width - left, lastCol - firstCol + 1 + pad * 2);
  const cropHeight = Math.min(height - top, emblemEnd - firstRow + 1 + pad * 2);

  if (cropWidth < 64 || cropHeight < 64) {
    throw new Error(`Emblem crop too small: ${cropWidth}x${cropHeight}`);
  }

  const buffer = await sharp(sourcePath)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .png()
    .toBuffer();

  return { buffer, width: cropWidth, height: cropHeight };
}

async function squareIcon(emblem, size, paddingRatio) {
  const inner = Math.max(1, Math.round(size * (1 - paddingRatio * 2)));
  const resized = await sharp(emblem)
    .resize(inner, inner, {
      fit: "contain",
      background: white,
      kernel: "lanczos3",
    })
    .png()
    .toBuffer();

  const top = Math.round((size - inner) / 2);
  const left = Math.round((size - inner) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: white,
    },
  })
    .composite([{ input: resized, top, left }])
    .png()
    .toBuffer();
}

function paddingFor(size) {
  if (size <= 96) return 0.08;
  return 0.12;
}

async function assertPngSize(filePath, expected) {
  const meta = await sharp(filePath).metadata();
  if (meta.width !== expected || meta.height !== expected) {
    throw new Error(
      `${path.relative(root, filePath)} is ${meta.width}x${meta.height}, expected ${expected}x${expected}`
    );
  }
  const { size } = await stat(filePath);
  if (size < 400) {
    throw new Error(`${path.relative(root, filePath)} looks empty (${size} bytes)`);
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const emblem = await extractEmblem(logoPath);
  console.log(`Emblem crop ${emblem.width}x${emblem.height} from ${path.relative(root, logoPath)}`);

  const mark = await squareIcon(emblem.buffer, 512, 0.08);
  await writeFile(markPath, mark);
  console.log(`Wrote ${path.relative(root, markPath)}`);

  for (const size of sizes) {
    const out = path.join(outDir, `icon-${size}x${size}.png`);
    await writeFile(out, await squareIcon(emblem.buffer, size, paddingFor(size)));
    console.log(`Wrote ${path.relative(root, out)}`);
  }

  const maskable = await squareIcon(emblem.buffer, 512, 0.22);
  const maskableOut = path.join(outDir, "maskable-icon-512x512.png");
  await writeFile(maskableOut, maskable);
  console.log(`Wrote ${path.relative(root, maskableOut)}`);

  const favicon = await squareIcon(emblem.buffer, 32, 0.06);
  const apple = await squareIcon(emblem.buffer, 180, 0.1);
  const appIcon = await squareIcon(emblem.buffer, 192, 0.1);

  await writeFile(faviconPath, favicon);
  await writeFile(appIconPath, appIcon);
  await writeFile(appleIconPath, apple);
  await writeFile(appleTouchPath, apple);

  const faviconSourcePath = path.join(root, "scripts/assets/shuleos-favicon-source.png");
  await mkdir(path.dirname(faviconSourcePath), { recursive: true });
  await writeFile(faviconSourcePath, mark);

  console.log(`Wrote ${path.relative(root, faviconPath)}`);
  console.log(`Wrote ${path.relative(root, appIconPath)}`);
  console.log(`Wrote ${path.relative(root, appleIconPath)}`);
  console.log(`Wrote ${path.relative(root, appleTouchPath)}`);
  console.log(`Wrote ${path.relative(root, faviconSourcePath)}`);

  await assertPngSize(markPath, 512);
  await assertPngSize(maskableOut, 512);
  await assertPngSize(appIconPath, 192);
  await assertPngSize(appleIconPath, 180);
  await assertPngSize(appleTouchPath, 180);
  for (const size of sizes) {
    await assertPngSize(path.join(outDir, `icon-${size}x${size}.png`), size);
  }

  console.log("Verified all generated icons");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
