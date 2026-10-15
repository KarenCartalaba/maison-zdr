import type { Event } from "@/types";

/**
 * "Upcoming" selection for public surfaces (homepage carousel).
 *
 * - Cancelled events never surface (the public API already excludes them,
 *   but this also guards data fetched client-side or merged from any source).
 * - Strictly in the future: `eventDate > now`. Events earlier today belong to
 *   the "ongoing" section, not this one.
 * - Ordered by `eventDate` ASC so the soonest event comes first. The API lists
 *   newest-created first (`orderBy: { createdAt: "desc" }`), which would put a
 *   recently created far-future event ahead of next week's — wrong order for a
 *   "what's coming up" list. Callers must slice AFTER this runs.
 *
 * Returns a new array; the input is never mutated.
 */
export function selectUpcomingEvents(
  events: Event[] | null | undefined,
  now: Date = new Date()
): Event[] {
  if (!events?.length) return [];
  const nowMs = now.getTime();
  return events
    .filter((event) => {
      if (event.isCancelled) return false;
      const eventDate = new Date(event.eventDate).getTime();
      return Number.isFinite(eventDate) && eventDate > nowMs;
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
}
