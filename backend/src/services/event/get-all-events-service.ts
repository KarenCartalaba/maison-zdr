import { EventRepository } from "@/repositories/event.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const eventRepo = new EventRepository();

// Cache keys — one per scope so the public (cancelled-free) list can never be
// served from a cache warmed by an admin request, and vice versa.
// Both are cleared by the `events:*` invalidation pattern.
const EVENTS_PUBLIC = "events:public"; // excludes cancelled events
const EVENTS_ALL = "events:all"; // admin/moderator: everything
const EVENTS_TTL = 300; // 5 min

/**
 * @param options.excludeCancelled hide cancelled events (public catalogue).
 *                                 Defaults to true so the public-safe listing
 *                                 is the default; admin callers pass false.
 */
export async function GetAllEventsService(options?: { excludeCancelled?: boolean }) {
  const excludeCancelled = options?.excludeCancelled ?? true;
  const cacheKey = excludeCancelled ? EVENTS_PUBLIC : EVENTS_ALL;

  try {
    // Check cache first
    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) {
      return { code: 200, status: "success", data: { events: cached } };
    }

    const events = await eventRepo.findAllEvents({ excludeCancelled });

    // Cache the result
    await cacheSet(cacheKey, events, EVENTS_TTL);

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
