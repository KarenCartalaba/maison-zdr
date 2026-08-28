import * as eventRepo from "@/repositories/event.repository";
import { generateSlug } from "@/utils/slug";

export async function CreateEventService(data: {
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  deadline: Date;
  minParticipants: number;
  maxParticipants: number;
  authorId: string;
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
    const event = await eventRepo.findEventById(id);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

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
    const events = await eventRepo.findAllEvents();

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
