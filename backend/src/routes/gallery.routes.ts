import { Router } from "express";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";
import { GalleryController } from "@/controllers/gallery.controller";

const router = Router();
const authMiddleware = new AuthMiddleware();
const galleryController = new GalleryController();

router.post(
  "/v1/upload",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  galleryController.upload
);

router.post(
  "/v1/delete",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  galleryController.delete
);

export default router;
