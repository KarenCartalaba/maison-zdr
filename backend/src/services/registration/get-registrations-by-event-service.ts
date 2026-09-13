import { RegistrationRepository } from "@/repositories/registration.repository";
import { EventRepository } from "@/repositories/event.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const registrationRepo = new RegistrationRepository();
const eventRepo = new EventRepository();

// Cache keys
const REG_BY_EVENT = (eventId: string) => `registrations:event:${eventId}`;
const REG_TTL = 120; // 2 min — registration counts change frequently

export async function GetRegistrationsByEventService(eventId: string) {
  try {
    // Check cache
    const cached = await cacheGet<any>(REG_BY_EVENT(eventId));
    if (cached) {
      return { code: 200, status: "success", data: cached };
    }

    const event = await eventRepo.findEventById(eventId);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    const registrations = await registrationRepo.findRegistrationsByEvent(eventId);
    const confirmedCount = await registrationRepo.countConfirmedRegistrations(eventId);

    const data = {
      registrations,
      confirmedCount,
      maxParticipants: event.maxParticipants,
      minParticipants: event.minParticipants,
    };

    await cacheSet(REG_BY_EVENT(eventId), data, REG_TTL);

    return {
      code: 200,
      status: "success",
      data,
    };
  } catch (error) {
    console.error("GetRegistrationsByEventService error", error);
    return { code: 500, status: "error", message: "Unable to fetch registrations" };
  }
}
