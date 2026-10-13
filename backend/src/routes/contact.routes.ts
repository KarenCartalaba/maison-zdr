import { Router } from "express";
import { ContactController } from "@/controllers/contact.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { validateSchema } from "@/middlewares/validate-schema";
import { contactSchema } from "@/schema/contact";
import { strictLimiter } from "@/lib/rate-limit";
import { Role } from "@/generated/prisma/enums";

const router = Router();
const contactController = new ContactController();
const authMiddleware = new AuthMiddleware();

router.post("/v1/send", strictLimiter, validateSchema(contactSchema), contactController.sendMessage);

// ==================== Admin: Contact Inbox ====================
router.get(
  "/v1/admin/messages",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  contactController.listMessages
);

export default router;
