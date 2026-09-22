import { Router } from "express";
import { AdminController } from "@/controllers/admin.controller";
import { EventController } from "@/controllers/event.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";

const router = Router();
const adminController = new AdminController();
const eventController = new EventController();
const authMiddleware = new AuthMiddleware();

// ==================== Dashboard ====================
router.get("/v1/dashboard/stats", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getDashboardStats);

// ==================== Events ====================
router.get("/v1/events", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), eventController.getAllEvents);
router.get("/v1/events/:id/workspace", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventWorkspace);
router.get("/v1/events/:id/participants", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventParticipants);
router.get("/v1/events/:id/reviews", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventReviews);

// ==================== Registrations ====================
router.get("/v1/registrations", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getAllRegistrations);
router.put("/v1/registrations/:id/status", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.updateRegistrationStatus);

// ==================== Check-ins ====================
router.get("/v1/checkins/events", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getAllCheckInEvents);
router.get("/v1/checkins/events/:id", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventCheckIn);
router.post("/v1/checkins/:id", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.checkInRegistration);

// ==================== Reviews ====================
router.get("/v1/reviews", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getAllReviews);
router.put("/v1/reviews/:id/status", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.updateReviewStatus);

export default router;
