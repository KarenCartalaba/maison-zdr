import { EventRepository } from "@/repositories/event.repository";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";

const eventRepo = new EventRepository();

// Cache keys
const EVENT_BY_ID = (id: string) => `event:${id}`;

export async function DeleteEventService(id: string) {
  try {
    const existing = await eventRepo.findEventById(id);
    if (!existing) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    await eventRepo.deleteEvent(id);

    // Invalidate this event + all event caches
    await cacheInvalidate(EVENT_BY_ID(id));
    await cacheInvalidatePattern("events:*");
    await cacheInvalidatePattern("admin:*");

    return {
      code: 200,
      status: "success",
      message: "Event deleted successfully",
    };
  } catch (error) {
    console.error("DeleteEventService error", error);
    return { code: 500, status: "error", message: "Unable to delete event" };
  }
}
