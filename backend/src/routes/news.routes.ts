import { Router } from "express";
import { NewsController } from "@/controllers/news.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";
import { validateSchema } from "@/middlewares/validate-schema";
import { createNewsSchema, updateNewsSchema } from "@/schema/news";

const router = Router();
const newsController = new NewsController();
const authMiddleware = new AuthMiddleware();

router.get("/v1/all", newsController.getAllNews);
router.get("/v1/:id", newsController.getNewsById);

router.post(
  "/v1/create",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  validateSchema(createNewsSchema),
  newsController.createNews
);
router.post(
  "/v1/update",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  validateSchema(updateNewsSchema),
  newsController.updateNews
);
router.post(
  "/v1/delete",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  newsController.deleteNews
);

export default router;
