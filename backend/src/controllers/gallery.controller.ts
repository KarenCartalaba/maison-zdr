import { Request, Response } from "express";
import { uploadImage, deleteImage, getPublicIdFromUrl } from "@/lib/cloudinary";

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

      // Validate file size (max 10MB) — estimate from base64 length
      const sizeBytes = Math.ceil((imageBase64.length * 3) / 4);
      if (sizeBytes > 10 * 1024 * 1024) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "Image file is too large. Maximum size is 10MB.",
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
          message: "Image file is too large. Maximum size is 10MB.",
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
