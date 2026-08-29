import { EventRepository } from "@/repositories/event.repository";
import { generateSlug } from "@/utils/slug";
import { cacheGet, cacheSet, cacheInvalidate, cacheInvalidatePattern } from "@/lib/redis";
import { EventType } from "@/generated/prisma/enums";

const eventRepo = new EventRepository();

// Cache keys
const EVENT_BY_ID = (id: string) => `event:${id}`;
const EVENT_BY_SLUG = (slug: string) => `event:slug:${slug}`;
const EVENTS_ALL = "events:all";
const EVENTS_TTL = 300; // 5 min

export async function CreateEventService(data: {
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  deadline: Date;
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

    const event = await eventRepo.createEvent({ ...data, slug });

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
    if (existing.slug) await cacheInvalidate(EVENT_BY_SLUG(existing.slug));
    await cacheInvalidatePattern("events:*");

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

export async function DeleteEventService(id: string) {
  try {
    const existing = await eventRepo.findEventById(id);
    if (!existing) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    await eventRepo.deleteEvent(id);

    // Invalidate this event + all event caches
    await cacheInvalidate(EVENT_BY_ID(id));
    if (existing.slug) await cacheInvalidate(EVENT_BY_SLUG(existing.slug));
    await cacheInvalidatePattern("events:*");

    return {
      code: 200,
      status: "success",
      message: "Event deleted successfully",
    };
  } catch (error) {
    console.error("DeleteEventService error", error);
    return { code: 500, status: "error", message: "Unable to delete event" };
  }
}

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
