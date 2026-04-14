/**
 * Compress all large images in /public/
 *
 * - Targets images over 500KB
 * - Resizes to max 1920px width (keeps aspect ratio)
 * - Compresses JPG/PNG in-place with quality tiers:
 *   - Hero/background images: target < 500KB, quality 80
 *   - Carousel/other images: target < 200KB, quality 75
 * - Skips logotransparent.png (needs transparency for favicon/nav)
 *
 * Run: npx tsx scripts/compress-images.ts
 */

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";

const PUBLIC_DIR = join(process.cwd(), "public");
const MAX_WIDTH = 1920;

// Hero/background images get higher quality ceiling
const HERO_PATTERNS = ["hero-bg", "cta-bg", "bamboo-cta-bg", "footer-bg", "footer", "booking-river"];
const SKIP_FILES = ["logotransparent.png", "powered-by-powertranz.jpg"];

const SUPPORTED_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const MIN_SIZE = 500 * 1024; // 500KB threshold

function isHeroImage(filename: string): boolean {
  return HERO_PATTERNS.some((p) => filename.toLowerCase().startsWith(p));
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}

async function compressImage(filePath: string, filename: string) {
  const originalStat = await stat(filePath);
  const originalSize = originalStat.size;

  if (originalSize < MIN_SIZE) return null;
  if (SKIP_FILES.includes(filename)) return null;

  const ext = extname(filename).toLowerCase();
  if (!SUPPORTED_EXTS.has(ext)) return null;

  const isHero = isHeroImage(filename);
  const targetSize = isHero ? 500 * 1024 : 200 * 1024;
  const label = isHero ? "hero/bg" : "carousel/other";

  // Start with higher quality, reduce if needed
  const isPng = ext === ".png";
  let quality = isHero ? 80 : 75;
  const minQuality = 40;

  let buffer: Buffer | null = null;

  while (quality >= minQuality) {
    const pipeline = sharp(filePath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .rotate(); // auto-rotate based on EXIF

    if (isPng) {
      // Convert PNG to JPEG for photos (much smaller), keep as PNG only if tiny
      buffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    } else {
      buffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    }

    if (buffer.length <= targetSize) break;
    quality -= 5;
  }

  if (!buffer) return null;

  // Only save if we actually reduced the size
  if (buffer.length >= originalSize) {
    return { filename, originalSize, newSize: originalSize, skipped: true, label };
  }

  // Write back — if PNG was converted to JPEG, save as .jpg
  // For simplicity, overwrite the original path (next/image handles format)
  const outputPath = isPng
    ? filePath // keep PNG path, but write compressed PNG instead
    : filePath;

  if (isPng) {
    // For PNGs, write compressed PNG (to preserve path references)
    const pngBuffer = await sharp(filePath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .rotate()
      .png({ quality: isHero ? 80 : 70, compressionLevel: 9 })
      .toBuffer();

    // Use whichever is smaller: compressed PNG or JPEG
    if (pngBuffer.length < buffer.length) {
      buffer = pngBuffer;
    } else {
      // JPEG is smaller but we need to keep .png extension for references
      // Use compressed PNG anyway (still much smaller than original)
      buffer = pngBuffer;
    }
  }

  await sharp(buffer).toFile(outputPath);

  return {
    filename,
    originalSize,
    newSize: buffer.length,
    skipped: false,
    label,
    quality,
  };
}

async function main() {
  const files = await readdir(PUBLIC_DIR);
  const imageFiles = files.filter((f) => {
    const ext = extname(f).toLowerCase();
    return SUPPORTED_EXTS.has(ext);
  });

  console.log(`Found ${imageFiles.length} images in /public/\n`);

  let totalOriginal = 0;
  let totalNew = 0;
  let compressed = 0;
  let skippedSmall = 0;

  for (const filename of imageFiles.sort()) {
    const filePath = join(PUBLIC_DIR, filename);
    const result = await compressImage(filePath, filename);

    if (!result) {
      skippedSmall++;
      continue;
    }

    if (result.skipped) {
      console.log(`  SKIP  ${result.filename} — ${formatSize(result.originalSize)} (already optimal)`);
      continue;
    }

    const savings = ((1 - result.newSize / result.originalSize) * 100).toFixed(0);
    console.log(
      `  ${formatSize(result.originalSize).padStart(7)} → ${formatSize(result.newSize).padStart(7)}  (${savings}% saved, q${result.quality})  ${result.filename}  [${result.label}]`,
    );

    totalOriginal += result.originalSize;
    totalNew += result.newSize;
    compressed++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Compressed: ${compressed} images`);
  console.log(`Skipped (under 500KB): ${skippedSmall}`);
  console.log(`Total saved: ${formatSize(totalOriginal)} → ${formatSize(totalNew)} (${formatSize(totalOriginal - totalNew)} saved)`);
}

main().catch((e) => {
  console.error("Compression failed:", e);
  process.exit(1);
});
