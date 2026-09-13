import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_PARTICIPANTS = (id: string) => `admin:participants:${id}`;
const ADMIN_TTL = 120;

export async function GetEventParticipantsService(eventId: string) {
  try {
    const cached = await cacheGet<any>(ADMIN_PARTICIPANTS(eventId));
    if (cached) return { code: 200, status: "success", message: "Event participants retrieved successfully", data: cached };

    const event = await adminRepo.findEventById(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const participants = await adminRepo.getEventParticipants(eventId);
    const data = { participants };
    await cacheSet(ADMIN_PARTICIPANTS(eventId), data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Event participants retrieved successfully", data };
  } catch (error) {
    console.error("GetEventParticipantsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event participants" };
  }
}
