import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/nodemailer";
import { redis } from "@/lib/redis";

/**
 * Generate a Redis key for tracking whether a reminder has been sent.
 */
function reminderKey(eventId: string, userId: string): string {
  return `reminder:sent:${eventId}:${userId}`;
}

/**
 * Check if a reminder has already been sent for this event+user pair.
 */
async function alreadySent(eventId: string, userId: string): Promise<boolean> {
  if (!redis) return false;
  try {
    const val = await redis.get(reminderKey(eventId, userId));
    return val === "1";
  } catch {
    return false;
  }
}

/**
 * Mark a reminder as sent for this event+user pair.
 * TTL of 72 hours so keys auto-expire (covers the 24-48h window + buffer).
 */
async function markSent(eventId: string, userId: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(reminderKey(eventId, userId), 72 * 60 * 60, "1");
  } catch {
    // Best-effort â€” if Redis fails we may send a duplicate, which is acceptable
  }
}

interface ReminderResult {
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  eventsProcessed: number;
  details: string[];
}

/**
 * Send reminder emails for events happening in the next 24-48 hours.
 *
 * 1. Find events whose eventDate is between now+24h and now+48h
 * 2. For each event, find all CONFIRMED registrations
 * 3. Skip users who already received a reminder (tracked in Redis)
 * 4. Send reminder email to each registered user
 * 5. Log results
 */
export async function sendEventReminders(): Promise<ReminderResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h
  const windowEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000);   // +48h

  const result: ReminderResult = {
    sentCount: 0,
    failedCount: 0,
    skippedCount: 0,
    eventsProcessed: 0,
    details: [],
  };

  try {
    // Find all non-cancelled events happening within the 24-48h window
    const events = await prisma.event.findMany({
      where: {
        isCancelled: false,
        eventDate: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        registrations: {
          where: { status: "CONFIRMED" },
          include: { user: true },
        },
      },
    });

    result.eventsProcessed = events.length;

    for (const event of events) {
      for (const registration of event.registrations) {
        const user = registration.user;

        if (!user?.email) {
          result.skippedCount++;
          continue;
        }

        // Skip if reminder already sent
        if (await alreadySent(event.id, user.id)) {
          result.skippedCount++;
          continue;
        }

        try {
          const eventDate = new Date(event.eventDate);
          const html = renderTemplate("event-reminder.html", {
            userName: user.name ?? "there",
            eventTitle: event.title,
            eventDate: eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            eventTime: eventDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            eventLocation: event.location,
            referenceNumber: registration.id.slice(0, 8).toUpperCase(),
          });

          await sendEmail({
            to: user.email,
            subject: `Reminder: ${event.title} is coming up!`,
            html,
          });

          await markSent(event.id, user.id);
          result.sentCount++;
          result.details.push(`âœ… Sent to ${user.email} for "${event.title}"`);
        } catch (error) {
          result.failedCount++;
          const msg = error instanceof Error ? error.message : String(error);
          result.details.push(`âŒ Failed for ${user.email} (${event.title}): ${msg}`);
          console.error(`Event reminder email failed for ${user.email}:`, error);
        }
      }
    }

    console.log(
      `[EventReminder] Completed: ${result.sentCount} sent, ${result.failedCount} failed, ${result.skippedCount} skipped across ${result.eventsProcessed} events`
    );
  } catch (error) {
    console.error("[EventReminder] Critical error:", error);
    result.details.push(
      `âŒ Critical error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return result;
}

/**
 * Admin-facing wrapper that returns a standard API response shape.
 */
export async function TriggerRemindersService() {
  try {
    const result = await sendEventReminders();
    return {
      code: 200 as const,
      status: "success" as const,
      message: `Reminders processed: ${result.sentCount} sent, ${result.failedCount} failed, ${result.skippedCount} skipped`,
      data: {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        skippedCount: result.skippedCount,
        eventsProcessed: result.eventsProcessed,
        details: result.details,
      },
    };
  } catch (error) {
    console.error("TriggerRemindersService error:", error);
    return {
      code: 500 as const,
      status: "error" as const,
      message: "Unable to trigger event reminders",
    };
  }
}
