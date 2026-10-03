/**
 * Client-side image downscale helper.
 *
 * Camera/phone originals are often multi-MB (plus ~33% base64 bloat), which
 * used to force uploads to bypass the same-origin /api proxy — losing the
 * first-party session cookie (401). Downscaling to <1MB lets every upload
 * ride the proxy instead.
 *
 * - Max dimension ~1600px (aspect ratio preserved), JPEG quality stepping
 *   down (0.82 → 0.5) until the data URL is under ~1MB.
 * - JPEG has no alpha channel: transparency is flattened onto white.
 * - GIFs pass through untouched (resampling would destroy animation);
 *   callers still enforce their own size/type checks first.
 */
const MAX_DIMENSION = 1600;
const TARGET_BYTES = 1_000_000;
const OUTPUT_MIME = "image/jpeg";
const QUALITIES = [0.82, 0.7, 0.6, 0.5];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Encode an already-loaded image onto a (possibly downscaled) canvas. */
async function encodeImage(
  img: HTMLImageElement,
  maxDimension: number
): Promise<string> {
  const longestSide = Math.max(img.naturalWidth, img.naturalHeight) || 1;
  const scale = Math.min(1, maxDimension / longestSide);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let dataUrl = canvas.toDataURL(OUTPUT_MIME, QUALITIES[0]);
  for (let i = 1; i < QUALITIES.length; i++) {
    // Base64 inflates ~4/3: estimate raw bytes from string length.
    const bytes = Math.floor((dataUrl.length * 3) / 4);
    if (bytes <= TARGET_BYTES) break;
    dataUrl = canvas.toDataURL(OUTPUT_MIME, QUALITIES[i]);
  }
  return dataUrl;
}

export async function downscaleImage(file: File, maxDimension = MAX_DIMENSION): Promise<string> {
  if (file.type === "image/gif") {
    return readAsDataURL(file);
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    return await encodeImage(img, maxDimension);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Same downscale, but for an existing data-URL payload (FileReader output).
 *
 * Payloads already small enough (or GIFs, whose animation a re-encode would
 * destroy) are returned byte-for-byte untouched; only oversized payloads are
 * re-encoded. Used by gallery upload so multi-MB base64 bodies fit through
 * the same-origin /api proxy.
 */
export async function downscaleDataUrl(
  dataUrl: string,
  maxDimension = MAX_DIMENSION
): Promise<string> {
  // SSR / non-DOM callers: nothing to draw with — pass through unchanged.
  if (typeof document === "undefined") return dataUrl;
  // ~1.1MB raw once base64-inflated: anything smaller is already proxy-safe.
  if (dataUrl.length <= 1_500_000) return dataUrl;

  const head = dataUrl.slice(0, dataUrl.indexOf(",") + 1).toLowerCase();
  if (head.includes("image/gif")) return dataUrl;

  try {
    // Route through a blob/object URL: some browsers refuse multi-MB data
    // URLs as an <img> src, while object URLs have no practical size limit.
    const blob = await (await fetch(dataUrl)).blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await loadImage(objectUrl);
      return await encodeImage(img, maxDimension);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    // Undecodable/exotic payload — send the original rather than drop it.
    return dataUrl;
  }
}
