import { Router } from "express";
import { ContactController } from "@/controllers/contact";
import { validateSchema } from "@/middlewares/validate-schema";
import { contactSchema } from "@/schema/contact";

const router = Router();
const contactController = new ContactController();

router.post("/v1/send", validateSchema(contactSchema), contactController.sendMessage);

export default router;
