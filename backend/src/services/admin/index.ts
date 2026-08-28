import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet, cacheInvalidatePattern } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const adminRepo = new AdminRepository();

// Cache keys
const ADMIN_STATS = "admin:stats";
const ADMIN_REG_TREND = "admin:reg-trend";
const ADMIN_REG_STATUS = "admin:reg-status";
const ADMIN_ATTENDANCE = "admin:attendance";
const ADMIN_CATEGORIES = "admin:categories";
const ADMIN_UPCOMING = "admin:upcoming";
const ADMIN_RECENT = "admin:recent";
const ADMIN_TOP = "admin:top";
const ADMIN_WORKSPACE = (id: string) => `admin:workspace:${id}`;
const ADMIN_PARTICIPANTS = (id: string) => `admin:participants:${id}`;
const ADMIN_REVIEWS = (id: string) => `admin:reviews:${id}`;
const ADMIN_TTL = 120; // 2 min for dashboard data

// ==================== Dashboard Stats ====================

export async function GetDashboardStatsService() {
  try {
    const cached = await cacheGet<any>(ADMIN_STATS);
    if (cached) return { code: 200, status: "success", message: "Dashboard stats retrieved successfully", data: cached };

    const [totalEvents, totalRegistrations, ongoingEvents, cancelledEvents] =
      await Promise.all([
        adminRepo.countAllEvents(),
        adminRepo.countAllRegistrations(),
        adminRepo.countOngoingEvents(),
        adminRepo.countCancelledEvents(),
      ]);

    const data = { totalEvents, totalRegistrations, ongoingEvents, cancelledEvents };
    await cacheSet(ADMIN_STATS, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Dashboard stats retrieved successfully", data };
  } catch (error) {
    console.error("GetDashboardStatsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve dashboard stats" };
  }
}

// ==================== Dashboard Charts ====================

export async function GetRegistrationTrendService() {
  try {
    const cached = await cacheGet<any>(ADMIN_REG_TREND);
    if (cached) return { code: 200, status: "success", message: "Registration trend retrieved successfully", data: cached };

    const trend = await adminRepo.getRegistrationTrend();
    const data = { trend };
    await cacheSet(ADMIN_REG_TREND, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Registration trend retrieved successfully", data };
  } catch (error) {
    console.error("GetRegistrationTrendService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registration trend" };
  }
}

export async function GetRegistrationStatusService() {
  try {
    const cached = await cacheGet<any>(ADMIN_REG_STATUS);
    if (cached) return { code: 200, status: "success", message: "Registration status retrieved successfully", data: cached };

    const status = await adminRepo.getRegistrationStatusCounts();
    const data = { status };
    await cacheSet(ADMIN_REG_STATUS, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Registration status retrieved successfully", data };
  } catch (error) {
    console.error("GetRegistrationStatusService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registration status" };
  }
}

export async function GetAttendanceTrendService() {
  try {
    const cached = await cacheGet<any>(ADMIN_ATTENDANCE);
    if (cached) return { code: 200, status: "success", message: "Attendance trend retrieved successfully", data: cached };

    const trend = await adminRepo.getAttendanceTrend();
    const data = { trend };
    await cacheSet(ADMIN_ATTENDANCE, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Attendance trend retrieved successfully", data };
  } catch (error) {
    console.error("GetAttendanceTrendService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve attendance trend" };
  }
}

export async function GetTopCategoriesService() {
  try {
    const cached = await cacheGet<any>(ADMIN_CATEGORIES);
    if (cached) return { code: 200, status: "success", message: "Top categories retrieved successfully", data: cached };

    const categories = await adminRepo.getTopCategories();
    const data = { categories };
    await cacheSet(ADMIN_CATEGORIES, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Top categories retrieved successfully", data };
  } catch (error) {
    console.error("GetTopCategoriesService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve top categories" };
  }
}

// ==================== Dashboard Tables ====================

export async function GetUpcomingEventsService(limit?: number) {
  try {
    const key = `${ADMIN_UPCOMING}:${limit || 5}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Upcoming events retrieved successfully", data: cached };

    const events = await adminRepo.getUpcomingEvents(limit || 5);
    const data = { events };
    await cacheSet(key, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Upcoming events retrieved successfully", data };
  } catch (error) {
    console.error("GetUpcomingEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve upcoming events" };
  }
}

export async function GetRecentRegistrationsService(limit?: number) {
  try {
    const key = `${ADMIN_RECENT}:${limit || 5}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Recent registrations retrieved successfully", data: cached };

    const registrations = await adminRepo.getRecentRegistrations(limit || 5);
    const data = { registrations };
    await cacheSet(key, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Recent registrations retrieved successfully", data };
  } catch (error) {
    console.error("GetRecentRegistrationsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve recent registrations" };
  }
}

export async function GetTopEventsService(limit?: number) {
  try {
    const key = `${ADMIN_TOP}:${limit || 3}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Top events retrieved successfully", data: cached };

    const events = await adminRepo.getTopEvents(limit || 3);
    const data = { events };
    await cacheSet(key, data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Top events retrieved successfully", data };
  } catch (error) {
    console.error("GetTopEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve top events" };
  }
}

// ==================== Event Workspace ====================

export async function GetEventWorkspaceService(eventId: string) {
  try {
    const cached = await cacheGet<any>(ADMIN_WORKSPACE(eventId));
    if (cached) return { code: 200, status: "success", message: "Event workspace retrieved successfully", data: cached };

    const event = await adminRepo.findEventById(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const data = { event };
    await cacheSet(ADMIN_WORKSPACE(eventId), data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Event workspace retrieved successfully", data };
  } catch (error) {
    console.error("GetEventWorkspaceService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event workspace" };
  }
}

export async function GetEventParticipantsService(eventId: string) {
  try {
    const cached = await cacheGet<any>(ADMIN_PARTICIPANTS(eventId));
    if (cached) return { code: 200, status: "success", message: "Event participants retrieved successfully", data: cached };

    const event = await adminRepo.findEventById(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const participants = await adminRepo.getEventParticipants(eventId);
    const data = { participants };
    await cacheSet(ADMIN_PARTICIPANTS(eventId), data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Event participants retrieved successfully", data };
  } catch (error) {
    console.error("GetEventParticipantsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event participants" };
  }
}

export async function GetEventReviewsService(eventId: string) {
  try {
    const cached = await cacheGet<any>(ADMIN_REVIEWS(eventId));
    if (cached) return { code: 200, status: "success", message: "Event reviews retrieved successfully", data: cached };

    const event = await adminRepo.findEventById(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const reviews = await adminRepo.getEventReviews(eventId);
    const data = { reviews };
    await cacheSet(ADMIN_REVIEWS(eventId), data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Event reviews retrieved successfully", data };
  } catch (error) {
    console.error("GetEventReviewsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event reviews" };
  }
}

export async function UpdateEventService(
  eventId: string,
  data: { title?: string; description?: string; location?: string; eventDate?: string; maxParticipants?: number; isCancelled?: boolean }
) {
  try {
    const event = await adminRepo.findEventById(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const updateData: any = { ...data };
    if (data.eventDate) {
      updateData.eventDate = new Date(data.eventDate);
    }

    const updated = await adminRepo.updateEvent(eventId, updateData);

    // Invalidate event + admin caches
    await cacheInvalidatePattern(`event:${eventId}*`);
    await cacheInvalidatePattern("admin:*");

    return {
      code: 200,
      status: "success",
      message: "Event updated successfully",
      data: { event: updated },
    };
  } catch (error) {
    console.error("UpdateEventService error", error);
    return { code: 500, status: "error", message: "Unable to update event" };
  }
}

// ==================== Registrations Management ====================

export async function GetAllRegistrationsService(filters?: { status?: string; search?: string; eventId?: string }) {
  try {
    const key = `admin:regs:${filters?.status || "ALL"}:${filters?.search || ""}:${filters?.eventId || ""}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Registrations retrieved successfully", data: cached };

    const [registrations, stats] = await Promise.all([
      adminRepo.getAllRegistrations(filters),
      adminRepo.getRegistrationStats(),
    ]);
    const data = { registrations, stats };
    await cacheSet(key, data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Registrations retrieved successfully", data };
  } catch (error) {
    console.error("GetAllRegistrationsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registrations" };
  }
}

export async function UpdateRegistrationStatusService(id: string, status: string) {
  try {
    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) return { code: 404, status: "error", message: "Registration not found" };

    const updated = await adminRepo.updateRegistrationStatus(id, status);
    await cacheInvalidatePattern("admin:regs:*");
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "Registration status updated", data: { registration: updated } };
  } catch (error) {
    console.error("UpdateRegistrationStatusService error", error);
    return { code: 500, status: "error", message: "Unable to update registration status" };
  }
}

// ==================== Check-ins ====================

export async function GetAllCheckInEventsService() {
  try {
    const cached = await cacheGet<any>("admin:checkin-events");
    if (cached) return { code: 200, status: "success", message: "Events retrieved successfully", data: cached };

    const events = await adminRepo.getAllCheckInEvents();
    const data = { events };
    await cacheSet("admin:checkin-events", data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Events retrieved successfully", data };
  } catch (error) {
    console.error("GetAllCheckInEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve events" };
  }
}

export async function GetEventCheckInService(eventId: string) {
  try {
    const event = await adminRepo.getEventForCheckIn(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const checkedInCount = event.registrations.filter((r) => r.checkedIn).length;
    const data = { event, checkedInCount, totalCount: event._count.registrations };
    return { code: 200, status: "success", message: "Event check-in data retrieved", data };
  } catch (error) {
    console.error("GetEventCheckInService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve check-in data" };
  }
}

export async function CheckInRegistrationService(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
    if (!registration) return { code: 404, status: "error", message: "Registration not found" };
    if (registration.checkedIn) return { code: 400, status: "error", message: "Already checked in" };

    const updated = await adminRepo.checkInRegistration(registrationId);
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "Check-in successful", data: { registration: updated } };
  } catch (error) {
    console.error("CheckInRegistrationService error", error);
    return { code: 500, status: "error", message: "Unable to check in" };
  }
}

// ==================== Reviews ====================

export async function GetAllReviewsService(filters?: { status?: string; search?: string }) {
  try {
    const key = `admin:reviews:${filters?.status || "ALL"}:${filters?.search || ""}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Reviews retrieved successfully", data: cached };

    const [reviews, stats] = await Promise.all([
      adminRepo.getAllReviews(filters),
      adminRepo.getReviewStats(),
    ]);
    const data = { reviews, stats };
    await cacheSet(key, data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Reviews retrieved successfully", data };
  } catch (error) {
    console.error("GetAllReviewsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve reviews" };
  }
}

export async function UpdateReviewStatusService(id: string, status: string) {
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return { code: 404, status: "error", message: "Review not found" };

    const updated = await adminRepo.updateReviewStatus(id, status);
    await cacheInvalidatePattern("admin:reviews:*");
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "Review status updated", data: { review: updated } };
  } catch (error) {
    console.error("UpdateReviewStatusService error", error);
    return { code: 500, status: "error", message: "Unable to update review status" };
  }
}

export async function ReplyToReviewService(id: string, reply: string) {
  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return { code: 404, status: "error", message: "Review not found" };

    const updated = await adminRepo.replyToReview(id, reply);
    await cacheInvalidatePattern("admin:reviews:*");
    return { code: 200, status: "success", message: "Reply added successfully", data: { review: updated } };
  } catch (error) {
    console.error("ReplyToReviewService error", error);
    return { code: 500, status: "error", message: "Unable to add reply" };
  }
}

// ==================== Users ====================

export async function GetAllUsersService(filters?: { role?: string; search?: string }) {
  try {
    const key = `admin:users:${filters?.role || "ALL"}:${filters?.search || ""}`;
    const cached = await cacheGet<any>(key);
    if (cached) return { code: 200, status: "success", message: "Users retrieved successfully", data: cached };

    const [users, stats] = await Promise.all([
      adminRepo.getAllUsers(filters),
      adminRepo.getUserStats(),
    ]);
    const data = { users, stats };
    await cacheSet(key, data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Users retrieved successfully", data };
  } catch (error) {
    console.error("GetAllUsersService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve users" };
  }
}

export async function UpdateUserRoleService(id: string, role: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { code: 404, status: "error", message: "User not found" };

    const updated = await adminRepo.updateUserRole(id, role);
    await cacheInvalidatePattern("admin:users:*");
    await cacheInvalidatePattern("admin:*");
    return { code: 200, status: "success", message: "User role updated", data: { user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } } };
  } catch (error) {
    console.error("UpdateUserRoleService error", error);
    return { code: 500, status: "error", message: "Unable to update user role" };
  }
}

// ==================== Analytics ====================

export async function GetAnalyticsOverviewService() {
  try {
    const cached = await cacheGet<any>("admin:analytics");
    if (cached) return { code: 200, status: "success", message: "Analytics retrieved successfully", data: cached };

    const data = await adminRepo.getAnalyticsOverview();
    await cacheSet("admin:analytics", data, ADMIN_TTL);
    return { code: 200, status: "success", message: "Analytics retrieved successfully", data };
  } catch (error) {
    console.error("GetAnalyticsOverviewService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve analytics" };
  }
}
