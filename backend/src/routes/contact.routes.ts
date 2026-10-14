import { Router } from "express";
import { ContactController } from "@/controllers/contact.controller";
import { validateSchema } from "@/middlewares/validate-schema";
import { contactSchema } from "@/schema/contact";
import { strictLimiter } from "@/lib/rate-limit";

const router = Router();
const contactController = new ContactController();

router.post("/v1/send", strictLimiter, validateSchema(contactSchema), contactController.sendMessage);

export default router;
