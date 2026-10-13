// Single source of truth for the public event status classification.
//
// Rule (calendar-day based, local time — "ongoing" is the event day itself):
//   - event day  < today  → "completed"  (shown as "Completed" user-side / "Past" admin-side)
//   - event day == today  → "ongoing"
//   - event day  > today  → "upcoming"
//
// Both the user-facing EventCard badges and the admin events tabs derive their
// status from this helper so an event can never be "Ongoing" for users while
// showing up as "Past" for admins (or vice versa).

export type EventPhase = "upcoming" | "ongoing" | "completed";

/** Compare the calendar-day portion of two dates (ignores time of day). */
export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Calendar day (midnight, local time) of the given date. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Classify an event date as upcoming / ongoing / completed.
 * Accepts anything `new Date(...)` understands (ISO string from the API or Date).
 */
export function getEventPhase(
  eventDate: Date | string | number,
  now: Date = new Date()
): EventPhase {
  const eventDay = startOfDay(new Date(eventDate));
  const today = startOfDay(now);

  if (eventDay.getTime() < today.getTime()) return "completed";
  if (isSameCalendarDay(eventDay, today)) return "ongoing";
  return "upcoming";
}
