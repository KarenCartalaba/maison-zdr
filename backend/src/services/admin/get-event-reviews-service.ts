import { AdminRepository } from "@/repositories/admin.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const adminRepo = new AdminRepository();

const ADMIN_REVIEWS = (id: string) => `admin:reviews:${id}`;
const ADMIN_TTL = 120;

export async function GetEventReviewsService(eventId: string) {
  try {
    const cached = await cacheGet<any>(ADMIN_REVIEWS(eventId));
    if (cached) return { code: 200, status: "success", message: "Event reviews retrieved successfully", data: cached };

    const event = await adminRepo.findEventById(eventId);
    if (!event) return { code: 404, status: "error", message: "Event not found" };

    const reviews = await adminRepo.getEventReviews(eventId);
    const data = { reviews };
    await cacheSet(ADMIN_REVIEWS(eventId), data, ADMIN_TTL);

    return { code: 200, status: "success", message: "Event reviews retrieved successfully", data };
  } catch (error) {
    console.error("GetEventReviewsService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve event reviews" };
  }
}
