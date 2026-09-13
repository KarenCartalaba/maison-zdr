import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_WORKSPACE = (id: string) => `admin:workspace:${id}`;
const ADMIN_TTL = 120;

export async function GetEventWorkspaceService(eventId: string) {
  try {
    const cached = await cacheGet<any>(ADMIN_WORKSPACE(eventId));
    if (cached) return { code: 200, status: "success", message: "Event workspace retrieved successfully", data: cached };

    const event = await adminRepo.findEventById(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const data = { event };
    await cacheSet(ADMIN_WORKSPACE(eventId), data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Event workspace retrieved successfully", data };
  } catch (error) {
    console.error("GetEventWorkspaceService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event workspace" };
  }
}
