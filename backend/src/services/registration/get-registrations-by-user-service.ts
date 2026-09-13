import { RegistrationRepository } from "@/repositories/registration.repository";
import { cacheGet, cacheSet } from "@/lib/redis";

const registrationRepo = new RegistrationRepository();

// Cache keys
const REG_BY_USER = (userId: string) => `registrations:user:${userId}`;
const REG_TTL = 120; // 2 min — registration counts change frequently

export async function GetRegistrationsByUserService(userId: string) {
  try {
    // Check cache
    const cached = await cacheGet<any>(REG_BY_USER(userId));
    if (cached) {
      return { code: 200, status: "success", data: cached };
    }

    const registrations = await registrationRepo.findRegistrationsByUser(userId);

    const data = { registrations };
    await cacheSet(REG_BY_USER(userId), data, REG_TTL);

    return {
      code: 200,
      status: "success",
      data,
    };
  } catch (error) {
    console.error("GetRegistrationsByUserService error", error);
    return { code: 500, status: "error", message: "Unable to fetch registrations" };
  }
}
