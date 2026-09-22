import { RegistrationRepository } from "@/repositories/registration.repository";

const registrationRepo = new RegistrationRepository();

export async function MyRegistrationsService(userId: string) {
  try {
    const registrations = await registrationRepo.findByUser(userId);

    return {
      code: 200,
      status: "success",
      data: { registrations },
    };
  } catch (error) {
    console.error("MyRegistrationsService error", error);
    return { code: 500, status: "error", message: "Failed to fetch registrations" };
  }
}
