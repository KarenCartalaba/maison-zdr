import { AdminRepository } from "@/repositories/admin.repository";

const adminRepo = new AdminRepository();

// ==================== Dashboard Stats ====================

export async function GetDashboardStatsService() {
  try {
    const [totalEvents, totalRegistrations, ongoingEvents, cancelledEvents] =
      await Promise.all([
        adminRepo.countAllEvents(),
        adminRepo.countAllRegistrations(),
        adminRepo.countOngoingEvents(),
        adminRepo.countCancelledEvents(),
      ]);

    return {
      code: 200,
      status: "success",
      message: "Dashboard stats retrieved successfully",
      data: { totalEvents, totalRegistrations, ongoingEvents, cancelledEvents },
    };
  } catch (error) {
    console.error("GetDashboardStatsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve dashboard stats" };
  }
}

// ==================== Dashboard Charts ====================

export async function GetRegistrationTrendService() {
  try {
    const trend = await adminRepo.getRegistrationTrend();
    return {
      code: 200,
      status: "success",
      message: "Registration trend retrieved successfully",
      data: { trend },
    };
  } catch (error) {
    console.error("GetRegistrationTrendService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registration trend" };
  }
}

export async function GetRegistrationStatusService() {
  try {
    const status = await adminRepo.getRegistrationStatusCounts();
    return {
      code: 200,
      status: "success",
      message: "Registration status retrieved successfully",
      data: { status },
    };
  } catch (error) {
    console.error("GetRegistrationStatusService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve registration status" };
  }
}

export async function GetAttendanceTrendService() {
  try {
    const trend = await adminRepo.getAttendanceTrend();
    return {
      code: 200,
      status: "success",
      message: "Attendance trend retrieved successfully",
      data: { trend },
    };
  } catch (error) {
    console.error("GetAttendanceTrendService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve attendance trend" };
  }
}

export async function GetTopCategoriesService() {
  try {
    const categories = await adminRepo.getTopCategories();
    return {
      code: 200,
      status: "success",
      message: "Top categories retrieved successfully",
      data: { categories },
    };
  } catch (error) {
    console.error("GetTopCategoriesService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve top categories" };
  }
}

// ==================== Dashboard Tables ====================

export async function GetUpcomingEventsService(limit?: number) {
  try {
    const events = await adminRepo.getUpcomingEvents(limit || 5);
    return {
      code: 200,
      status: "success",
      message: "Upcoming events retrieved successfully",
      data: { events },
    };
  } catch (error) {
    console.error("GetUpcomingEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve upcoming events" };
  }
}

export async function GetRecentRegistrationsService(limit?: number) {
  try {
    const registrations = await adminRepo.getRecentRegistrations(limit || 5);
    return {
      code: 200,
      status: "success",
      message: "Recent registrations retrieved successfully",
      data: { registrations },
    };
  } catch (error) {
    console.error("GetRecentRegistrationsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve recent registrations" };
  }
}

export async function GetTopEventsService(limit?: number) {
  try {
    const events = await adminRepo.getTopEvents(limit || 3);
    return {
      code: 200,
      status: "success",
      message: "Top events retrieved successfully",
      data: { events },
    };
  } catch (error) {
    console.error("GetTopEventsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve top events" };
  }
}

// ==================== Event Workspace ====================

export async function GetEventWorkspaceService(eventId: string) {
  try {
    const event = await adminRepo.findEventById(eventId);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    return {
      code: 200,
      status: "success",
      message: "Event workspace retrieved successfully",
      data: { event },
    };
  } catch (error) {
    console.error("GetEventWorkspaceService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event workspace" };
  }
}

export async function GetEventParticipantsService(eventId: string) {
  try {
    const event = await adminRepo.findEventById(eventId);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    const participants = await adminRepo.getEventParticipants(eventId);
    return {
      code: 200,
      status: "success",
      message: "Event participants retrieved successfully",
      data: { participants },
    };
  } catch (error) {
    console.error("GetEventParticipantsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event participants" };
  }
}

export async function GetEventReviewsService(eventId: string) {
  try {
    const event = await adminRepo.findEventById(eventId);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    const reviews = await adminRepo.getEventReviews(eventId);
    return {
      code: 200,
      status: "success",
      message: "Event reviews retrieved successfully",
      data: { reviews },
    };
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
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    const updateData: any = { ...data };
    if (data.eventDate) {
      updateData.eventDate = new Date(data.eventDate);
    }

    const updated = await adminRepo.updateEvent(eventId, updateData);

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
