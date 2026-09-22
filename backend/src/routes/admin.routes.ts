import { Router } from "express";
import { AdminController } from "@/controllers/admin.controller";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { permittedRole } from "@/middlewares/rbac-middleware";
import { validateSchema } from "@/middlewares/validate-schema";
import { updateRegistrationStatusSchema, updateReviewStatusSchema } from "@/schema/shared";
import { Role } from "@/generated/prisma/enums";

const router = Router();
const adminController = new AdminController();
const authMiddleware = new AuthMiddleware();

// ==================== Dashboard Stats ====================
router.get("/v1/dashboard/stats", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getDashboardStats);

// ==================== Dashboard Charts ====================
router.get("/v1/dashboard/registration-trend", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getRegistrationTrend);
router.get("/v1/dashboard/registration-status", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getRegistrationStatus);
router.get("/v1/dashboard/attendance-trend", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getAttendanceTrend);
router.get("/v1/dashboard/top-categories", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getTopCategories);

// ==================== Dashboard Tables ====================
router.get("/v1/dashboard/upcoming-events", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getUpcomingEvents);
router.get("/v1/dashboard/recent-registrations", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getRecentRegistrations);
router.get("/v1/dashboard/top-events", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getTopEvents);

// ==================== Event Workspace ====================
router.get("/v1/events/:id/workspace", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventWorkspace);
router.get("/v1/events/:id/participants", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventParticipants);
router.get("/v1/events/:id/reviews", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventReviews);
router.put("/v1/events/:id", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.updateEvent);

// ==================== Registrations Management ====================
router.get("/v1/registrations", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getAllRegistrations);
router.put("/v1/registrations/:id/status", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), validateSchema(updateRegistrationStatusSchema), adminController.updateRegistrationStatus);

// ==================== Check-ins ====================
router.get("/v1/checkins/events", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getAllCheckInEvents);
router.get("/v1/checkins/events/:id", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getEventCheckIn);
router.post("/v1/checkins/:id", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.checkInRegistration);

// ==================== Reviews Management ====================
router.get("/v1/reviews", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), adminController.getAllReviews);
router.put("/v1/reviews/:id/status", authMiddleware.execute, permittedRole([Role.ADMIN, Role.MODERATOR]), validateSchema(updateReviewStatusSchema), adminController.updateReviewStatus);
router.post("/v1/reviews/:id/reply", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.replyToReview);

// ==================== Users Management ====================
router.get("/v1/users", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.getAllUsers);
router.get("/v1/users/:id", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.getUserDetails);
router.put("/v1/users/:id/role", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.updateUserRole);
router.put("/v1/users/:id/verify", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.verifyUser);
router.put("/v1/users/:id/suspend", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.suspendUser);
router.delete("/v1/users/:id", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.deleteUser);

// ==================== Analytics ====================
router.get("/v1/analytics/overview", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.getAnalyticsOverview);

// ==================== Reminders ====================
router.post("/v1/reminders/trigger", authMiddleware.execute, permittedRole([Role.ADMIN]), adminController.triggerReminders);

export default router;
