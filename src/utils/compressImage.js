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

// Decodes the file so it can be drawn on a canvas, upright. createImageBitmap
// is preferred; without it an <img> is used, because browsers apply the photo's
// EXIF orientation to <img> by default. Either way the result is rotated the
// way the photo is meant to be seen: a phone photo that is stored sideways with
// an EXIF flag must not be sent sideways (face detection ignores EXIF).
// Resolves to null when the browser can do neither.
async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { drawable: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close?.() };
  }
  if (typeof Image === "undefined" || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return null;
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    return { drawable: image, width: image.naturalWidth, height: image.naturalHeight, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
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
  if (typeof document === "undefined") return file;

  let decoded;
  try {
    decoded = await decodeImage(file);
    if (!decoded) return file;
    const { width, height } = targetSize(decoded.width, decoded.height, maxDimension);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;

    // JPEG has no transparency; without a white base, transparent PNG
    // areas would come out black.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(decoded.drawable, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], withJpgExtension(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    decoded?.close();
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
