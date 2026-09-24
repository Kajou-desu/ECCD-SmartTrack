// Client-side image compression, applied to every upload in src/api/client.js.
//
// Phone photos are routinely 4–12 MB. Shrinking them in the browser before
// they're sent cuts upload time (which matters on mobile data), keeps the
// server's storage and bandwidth down, and — because the image is redrawn
// from pixels — drops embedded metadata such as GPS location. The server
// still validates every file independently; this is an optimization, never
// a trust boundary.

// GIF is left alone (a canvas redraw would flatten the animation); PDFs and
// documents aren't images at all.
const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const MAX_IMAGE_DIMENSION = 2000; // px on the longest side
export const IMAGE_QUALITY = 0.8;

// Fits (width, height) inside a max×max box, keeping the aspect ratio.
// Never scales up.
export function targetSize(width, height, maxDimension = MAX_IMAGE_DIMENSION) {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };

  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function withJpgExtension(name) {
  const dot = name.lastIndexOf(".");
  return `${dot > 0 ? name.slice(0, dot) : name}.jpg`;
}

// Returns a smaller JPEG File, or the ORIGINAL file untouched whenever
// compressing isn't possible or wouldn't help (not a compressible image,
// browser lacks the APIs, image fails to decode, or the result isn't
// actually smaller). It never throws — a failure here must not block an
// upload that would have worked without it.
export async function compressImage(
  file,
  { maxDimension = MAX_IMAGE_DIMENSION, quality = IMAGE_QUALITY } = {},
) {
  if (typeof File === "undefined" || !(file instanceof File) || !COMPRESSIBLE_TYPES.has(file.type)) {
    return file;
  }
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = targetSize(bitmap.width, bitmap.height, maxDimension);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;

    // JPEG has no transparency; without a white base, transparent PNG
    // areas would come out black.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], withJpgExtension(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    bitmap?.close?.();
  }
}

// One at a time, deliberately: decoding a 12-megapixel photo holds ~48 MB
// of pixels, so doing a 20-photo album in parallel could exhaust a phone's
// memory. Order is preserved.
export async function compressImages(files, options) {
  const result = [];
  for (const file of files) {
    result.push(await compressImage(file, options));
  }
  return result;
}
