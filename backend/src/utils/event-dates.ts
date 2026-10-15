/**
 * Event timing helpers shared by the create/update/review services.
 *
 * Every Maison ZDR event has an explicit END datetime — review availability,
 * "has this event ended" checks and the public detail page all read it, so a
 * start date alone is never enough.
 */

/** Runtime assumed when only a start datetime is supplied (matches the
 *  start → start + 3h range shown on the event detail page). */
export const DEFAULT_EVENT_DURATION_MS = 3 * 60 * 60 * 1000;

/** End datetime derived from a start datetime when none was supplied. */
export function deriveEndDate(eventDate: Date | string): Date {
  return new Date(new Date(eventDate).getTime() + DEFAULT_EVENT_DURATION_MS);
}

/**
 * Reviews auto-open at the END of the event — no manual override.
 * A missing endDate fails closed (reviews stay shut) rather than opening early.
 */
export function reviewsAreOpen(
  event: { endDate: Date | string | null | undefined },
  now: Date = new Date(),
): boolean {
  if (!event.endDate) return false;
  const end = new Date(event.endDate).getTime();
  return Number.isFinite(end) && end <= now.getTime();
}
