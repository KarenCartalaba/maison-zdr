import { AdminRepository } from "@/repositories/admin.repository";
import { cacheInvalidatePattern } from "@/lib/redis";

const adminRepo = new AdminRepository();

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

    // Invalidate event + admin + public list caches
    await cacheInvalidatePattern(`event:${eventId}*`);
    await cacheInvalidatePattern("admin:*");
    await cacheInvalidatePattern("events:*");

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
