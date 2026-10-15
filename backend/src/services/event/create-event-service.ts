import { EventRepository } from "@/repositories/event.repository";
import { generateSlug } from "@/utils/slug";
import { deriveEndDate } from "@/utils/event-dates";
import { cacheInvalidatePattern } from "@/lib/redis";
import { EventType } from "@/generated/prisma/enums";

const eventRepo = new EventRepository();

export async function CreateEventService(data: {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  endDate?: string;
  deadline: string;
  minParticipants: number;
  maxParticipants: number;
  authorId: string;
  eventType?: EventType;
  gallery?: string[];
}) {
  try {
    if (data.minParticipants > data.maxParticipants) {
      return { code: 400, status: "error", message: "Min participants cannot exceed max participants" };
    }

    if (new Date(data.deadline) >= new Date(data.eventDate)) {
      return { code: 400, status: "error", message: "Deadline must be before the event date" };
    }

    // The event must end after it starts — review availability is derived from
    // endDate, so it can never be missing or before the start.
    const endDate = data.endDate ? new Date(data.endDate) : deriveEndDate(data.eventDate);
    if (endDate.getTime() <= new Date(data.eventDate).getTime()) {
      return { code: 400, status: "error", message: "End date must be after the event date" };
    }

    const slug = generateSlug(data.title);

    const existing = await eventRepo.findEventBySlug(slug);
    if (existing) {
      return { code: 409, status: "error", message: "An event with a similar title already exists" };
    }

    const event = await eventRepo.createEvent({
      ...data,
      endDate: endDate.toISOString(),
      eventType: data.eventType ?? "ARTS",
      slug,
    });

    // Invalidate events list cache
    await cacheInvalidatePattern("events:*");
    await cacheInvalidatePattern("admin:*");

    return {
      code: 201,
      status: "success",
      message: "Event created successfully",
      data: { event },
    };
  } catch (error) {
    console.error("CreateEventService error", error);
    return { code: 500, status: "error", message: "Unable to create event" };
  }
}
