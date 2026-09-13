import { AdminRepository } from "@/repositories/admin.repository";

const adminRepo = new AdminRepository();

export async function GetEventCheckInService(eventId: string) {
  try {
    const event = await adminRepo.getEventForCheckIn(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const checkedInCount = event.registrations.filter((r: { checkedIn: boolean }) => r.checkedIn).length;
    const data = { event, registrations: event.registrations, checkedInCount, totalCount: event._count.registrations };
    return { code: 200, status: "success", message: "Event check-in data retrieved", data };
  } catch (error) {
    console.error("GetEventCheckInService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve check-in data" };
  }
}
