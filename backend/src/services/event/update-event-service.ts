import { EventRepository } from "@/repositories/event.repository";
import { generateSlug } from "@/utils/slug";
import { cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";
import { EventType } from "@/generated/prisma/enums";

const eventRepo = new EventRepository();

// Cache keys
const EVENT_BY_ID = (id: string) => `event:${id}`;

export async function UpdateEventService(data: {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  eventDate?: Date;
  deadline?: Date;
  minParticipants?: number;
  maxParticipants?: number;
  eventType?: EventType;
  isCancelled?: boolean;
  allowReviewsNow?: boolean;
  gallery?: string[];
}) {
  try {
    const existing = await eventRepo.findEventById(data.id);
    if (!existing) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    const updateData: any = { ...data };
    delete updateData.id;

    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    if (data.eventDate && data.deadline && new Date(data.deadline) >= new Date(data.eventDate)) {
      return { code: 400, status: "error", message: "Deadline must be before the event date" };
    }

    const event = await eventRepo.updateEvent(data.id, updateData);

    // Invalidate this event + list cache
    await cacheInvalidate(EVENT_BY_ID(data.id));
    await cacheInvalidatePattern("events:*");
    await cacheInvalidatePattern("admin:*");

    return {
      code: 200,
      status: "success",
      message: "Event updated successfully",
      data: { event },
    };
  } catch (error) {
    console.error("UpdateEventService error", error);
    return { code: 500, status: "error", message: "Unable to update event" };
  }
}
