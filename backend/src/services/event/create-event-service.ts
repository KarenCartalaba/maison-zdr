import { EventRepository } from "@/repositories/event.repository";
import { generateSlug } from "@/utils/slug";
import { cacheInvalidatePattern } from "@/lib/redis";
import { EventType } from "@/generated/prisma/enums";

const eventRepo = new EventRepository();

export async function CreateEventService(data: {
  title: string;
  description: string;
  location: string;
  eventDate: string;
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

    const slug = generateSlug(data.title);

    const existing = await eventRepo.findEventBySlug(slug);
    if (existing) {
      return { code: 409, status: "error", message: "An event with a similar title already exists" };
    }

    const event = await eventRepo.createEvent({ ...data, eventType: data.eventType ?? "SOCIAL", slug });

    // Invalidate events list cache
    await cacheInvalidatePattern("events:*");

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
