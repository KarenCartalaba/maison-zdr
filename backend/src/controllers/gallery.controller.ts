import { Request, Response } from "express";
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary";

/** Accepted image MIME types and their magic-byte signatures. */
const ACCEPTED_FORMATS: { mime: string; magic: number[][] }[] = [
  { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  { mime: "image/png",  magic: [[0x89, 0x50, 0x4e, 0x47]] },
  { mime: "image/gif",  magic: [[0x47, 0x49, 0x46, 0x38]] }, // GIF87a / GIF89a
  { mime: "image/webp", magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF....WEBP
];

const DECODED_SIZE_CAP = 5 * 1024 * 1024; // 5 MB

/**
 * Validate the magic bytes of a base64-encoded image.
 * Returns the detected MIME type string or null when the bytes are unrecognised.
 */
function detectImageMime(base64: string): string | null {
  // Strip optional data-URI prefix (e.g. "data:image/png;base64,")
  const raw = base64.includes(",") ? base64.split(",")[1] : base64;

  // Decode enough bytes to match all signatures (max 4 bytes needed)
  const decoded = Buffer.from(raw.slice(0, 8), "base64");
  const bytes = Array.from(decoded);

  for (const { mime, magic } of ACCEPTED_FORMATS) {
    if (magic.some((sig) => sig.every((b, i) => bytes[i] === b))) {
      return mime;
    }
  }
  return null;
}

/**
 * Estimate the decoded byte length of a base64 string (ignoring data-URI prefix).
 */
function estimateDecodedSize(base64: string): number {
  const raw = base64.includes(",") ? base64.split(",")[1] : base64;
  return Math.ceil((raw.length * 3) / 4);
}

export class GalleryController {
  public upload = async (req: Request, res: Response) => {
    try {
      const { imageBase64, folder } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "imageBase64 is required",
        });
      }

      // Validate decoded file size (max 5 MB)
      const sizeBytes = estimateDecodedSize(imageBase64);
      if (sizeBytes > DECODED_SIZE_CAP) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "Image file is too large. Maximum decoded size is 5 MB.",
        });
      }

      // Validate magic bytes (JPEG / PNG / WebP / GIF only)
      const mime = detectImageMime(imageBase64);
      if (!mime) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "Unsupported image format. Accepted formats: JPEG, PNG, WebP, GIF.",
        });
      }

      const result = await uploadImage(imageBase64, folder || "maison-zdr/gallery");

      return res.status(201).json({
        code: 201,
        status: "success",
        message: "Image uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      });
    } catch (error: any) {
      console.error("Gallery upload error", error);

      if (error.http_code === 403) {
        return res.status(503).json({
          code: 503,
          status: "error",
          message: "Image upload service temporarily unavailable. Please try again later.",
        });
      }

      if (error.http_code === 413 || error.message?.includes("File size too large")) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "Image file is too large. Maximum decoded size is 5 MB.",
        });
      }

      return res.status(500).json({
        code: 500,
        status: "error",
        message: "Unable to upload image. Please try again later.",
      });
    }
  };

  public delete = async (req: Request, res: Response) => {
    try {
      const { url, publicId } = req.body;
      const id = publicId || (url ? getPublicIdFromUrl(url) : null);

      if (!id) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "url or publicId is required",
        });
      }

      await deleteImage(id);

      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Gallery delete error", error);
      return res.status(500).json({
        code: 500,
        status: "error",
        message: "Unable to delete image",
      });
    }
  };
}
