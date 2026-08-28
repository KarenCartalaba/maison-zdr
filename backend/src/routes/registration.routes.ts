import { Router } from "express";
import { RegistrationController } from "@/controllers/registration.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";
import { validateSchema } from "@/middlewares/validate-schema";
import { registerSchema, cancelRegistrationSchema } from "@/schema/registration";

const router = Router();
const registrationController = new RegistrationController();
const authMiddleware = new AuthMiddleware();

router.post("/v1/register", authMiddleware.execute, validateSchema(registerSchema), registrationController.register);
router.post("/v1/cancel", authMiddleware.execute, validateSchema(cancelRegistrationSchema), registrationController.cancel);
router.get("/v1/event/:eventId", authMiddleware.execute, permittedRole([Role.ADMIN]), registrationController.getByEvent);
router.get("/v1/user/:userId", authMiddleware.execute, permittedRole([Role.ADMIN]), registrationController.getByUser);

export default router;
