import { Router } from "express";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";
import { uploadImage, deleteImage, extractPublicId } from "@/lib/cloudinary";

const router = Router();
const authMiddleware = new AuthMiddleware();

/**
 * POST /api/gallery/v1/upload
 * Upload an image to Cloudinary. Returns the URL.
 */
router.post(
  "/v1/upload",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  async (req, res) => {
    try {
      const { imageBase64, folder } = req.body;

      if (!imageBase64) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "imageBase64 is required",
        });
      }

      // Convert base64 to buffer
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const result = await uploadImage(buffer, folder || "maison-zdr/gallery");

      return res.status(201).json({
        code: 201,
        status: "success",
        message: "Image uploaded successfully",
        data: {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      });
    } catch (error) {
      console.error("Gallery upload error", error);
      return res.status(500).json({
        code: 500,
        status: "error",
        message: "Unable to upload image",
      });
    }
  }
);

/**
 * POST /api/gallery/v1/delete
 * Delete an image from Cloudinary by URL or publicId.
 */
router.post(
  "/v1/delete",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  async (req, res) => {
    try {
      const { url, publicId } = req.body;
      const id = publicId || (url ? extractPublicId(url) : null);

      if (!id) {
        return res.status(400).json({
          code: 400,
          status: "error",
          message: "url or publicId is required",
        });
      }

      const result = await deleteImage(id);

      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Image deleted successfully",
        data: { result },
      });
    } catch (error) {
      console.error("Gallery delete error", error);
      return res.status(500).json({
        code: 500,
        status: "error",
        message: "Unable to delete image",
      });
    }
  }
);

export default router;
