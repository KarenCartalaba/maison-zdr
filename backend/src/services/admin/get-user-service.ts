import { AdminRepository } from "@/repositories/admin.repository";

const adminRepo = new AdminRepository();

export async function GetUserService(id: string) {
  try {
    const user = await adminRepo.findUserById(id);
    if (!user) return { code: 404, status: "error", message: "User not found" };

    return { code: 200, status: "success", message: "User retrieved successfully", data: { user } };
  } catch (error) {
    console.error("GetUserService error", error);
    return { code: 500, status: "error", message: "Unable to retrieve user" };
  }
}
