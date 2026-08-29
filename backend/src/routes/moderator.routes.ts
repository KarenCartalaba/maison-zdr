import { Router } from "express";
import { AdminController } from "@/controllers/admin.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";

const router = Router();
const adminController = new AdminController();
const authMiddleware = new AuthMiddleware();

const modOrAdmin = permittedRole([Role.ADMIN, Role.MODERATOR]);

// ==================== Dashboard ====================

router.get(
  "/v1/dashboard/stats",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getDashboardStats
);

// ==================== Events ====================

router.get(
  "/v1/events",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getDashboardStats // placeholder; real list events handled by admin route
);

router.get(
  "/v1/events/:id/workspace",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getEventWorkspace
);

router.get(
  "/v1/events/:id/participants",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getEventParticipants
);

router.get(
  "/v1/events/:id/reviews",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getEventReviews
);

// ==================== Registrations ====================

router.get(
  "/v1/registrations",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getAllRegistrations
);

router.put(
  "/v1/registrations/:id/status",
  authMiddleware.execute,
  modOrAdmin,
  adminController.updateRegistrationStatus
);

// ==================== Check-ins ====================

router.get(
  "/v1/checkins/events",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getAllCheckInEvents
);

router.get(
  "/v1/checkins/events/:id",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getEventCheckIn
);

router.post(
  "/v1/checkins/:id",
  authMiddleware.execute,
  modOrAdmin,
  adminController.checkInRegistration
);

// ==================== Reviews ====================

router.get(
  "/v1/reviews",
  authMiddleware.execute,
  modOrAdmin,
  adminController.getAllReviews
);

router.put(
  "/v1/reviews/:id/status",
  authMiddleware.execute,
  modOrAdmin,
  adminController.updateReviewStatus
);

export default router;
