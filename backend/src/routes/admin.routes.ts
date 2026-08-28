import { Router } from "express";
import { AdminController } from "@/controllers/admin.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { Role } from "@/generated/prisma/enums";

const router = Router();
const adminController = new AdminController();
const authMiddleware = new AuthMiddleware();

// ==================== Dashboard Stats ====================

router.get(
  "/v1/dashboard/stats",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getDashboardStats
);

// ==================== Dashboard Charts ====================

router.get(
  "/v1/dashboard/registration-trend",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getRegistrationTrend
);

router.get(
  "/v1/dashboard/registration-status",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getRegistrationStatus
);

router.get(
  "/v1/dashboard/attendance-trend",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getAttendanceTrend
);

router.get(
  "/v1/dashboard/top-categories",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getTopCategories
);

// ==================== Dashboard Tables ====================

router.get(
  "/v1/dashboard/upcoming-events",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getUpcomingEvents
);

router.get(
  "/v1/dashboard/recent-registrations",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getRecentRegistrations
);

router.get(
  "/v1/dashboard/top-events",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getTopEvents
);

// ==================== Event Workspace ====================

router.get(
  "/v1/events/:id/workspace",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getEventWorkspace
);

router.get(
  "/v1/events/:id/participants",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getEventParticipants
);

router.get(
  "/v1/events/:id/reviews",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.getEventReviews
);

router.put(
  "/v1/events/:id",
  authMiddleware.execute,
  permittedRole([Role.ADMIN]),
  adminController.updateEvent
);

export default router;
