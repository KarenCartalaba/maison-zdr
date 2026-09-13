import { EventRepository } from "@/repositories/event.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const eventRepo = new EventRepository();

// Cache keys
const EVENTS_ALL = "events:all";
const EVENTS_TTL = 300; // 5 min

export async function GetAllEventsService() {
  try {
    // Check cache first
    const cached = await cacheGet<any[]>(EVENTS_ALL);
    if (cached) {
      return { code: 200, status: "success", data: { events: cached } };
    }

    const events = await eventRepo.findAllEvents();

    // Cache the result
    await cacheSet(EVENTS_ALL, events, EVENTS_TTL);

    return {
      code: 200,
      status: "success",
      data: { events },
    };
  } catch (error) {
    console.error("GetAllEventsService error", error);
    return { code: 500, status: "error", message: "Unable to fetch events" };
  }
}
