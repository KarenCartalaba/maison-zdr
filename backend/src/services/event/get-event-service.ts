import { EventRepository } from "@/repositories/event.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const eventRepo = new EventRepository();

// Cache keys
const EVENT_BY_ID = (id: string) => `event:${id}`;
const EVENTS_TTL = 300; // 5 min

export async function GetEventService(id: string) {
  try {
    // Check cache first
    const cached = await cacheGet<any>(EVENT_BY_ID(id));
    if (cached) {
      return { code: 200, status: "success", data: { event: cached } };
    }

    const event = await eventRepo.findEventById(id);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    // Cache the result
    await cacheSet(EVENT_BY_ID(id), event, EVENTS_TTL);

    return {
      code: 200,
      status: "success",
      data: { event },
    };
  } catch (error) {
    console.error("GetEventService error", error);
    return { code: 500, status: "error", message: "Unable to fetch event" };
  }
}
