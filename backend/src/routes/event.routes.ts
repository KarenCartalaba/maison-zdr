import { Router } from "express";
import { EventController } from "@/controllers/event.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";
import { validateSchema } from "@/middlewares/validate-schema";
import { createEventSchema, updateEventSchema } from "@/schema/event";

const router = Router();
const eventController = new EventController();
const authMiddleware = new AuthMiddleware();

router.get("/v1/all", eventController.getAllEvents);
router.get("/v1/:id", eventController.getEvent);
router.get("/v1/:id/reviews", eventController.getEventReviews);

router.post("/v1/create", authMiddleware.execute, permittedRole([Role.ADMIN]), validateSchema(createEventSchema), eventController.createEvent);
router.post("/v1/update", authMiddleware.execute, permittedRole([Role.ADMIN]), validateSchema(updateEventSchema), eventController.updateEvent);
router.post("/v1/delete", authMiddleware.execute, permittedRole([Role.ADMIN]), eventController.deleteEvent);

export default router;
