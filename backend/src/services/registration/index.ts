import * as registrationRepo from "@/repositories/registration.repository";
import * as eventRepo from "@/repositories/event.repository";
import * as authRepo from "@/repositories/auth.repository";
import { renderTemplate } from "@/utils/template";
import { sendEmail } from "@/lib/nodemailer";

export async function RegisterForEventService(
  userId: string,
  eventId: string,
  hasPlusOne: boolean,
  guestName?: string
) {
  try {
    const event = await eventRepo.findEventById(eventId);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    if (event.isCancelled) {
      return { code: 400, status: "error", message: "This event has been cancelled" };
    }

    if (new Date() > new Date(event.deadline)) {
      return { code: 400, status: "error", message: "Registration deadline has passed" };
    }

    const existing = await registrationRepo.findRegistration(userId, eventId);
    if (existing && existing.status === "CONFIRMED") {
      return { code: 409, status: "error", message: "Already registered for this event" };
    }

    const confirmedCount = await registrationRepo.countConfirmedRegistrations(eventId);
    const slotsNeeded = hasPlusOne ? 2 : 1;

    if (confirmedCount + slotsNeeded > event.maxParticipants) {
      return { code: 400, status: "error", message: "Event is at full capacity" };
    }

    if (hasPlusOne && !guestName) {
      return { code: 400, status: "error", message: "Guest name is required for plus-one registration" };
    }

    const registration = await registrationRepo.createRegistration({
      userId,
      eventId,
      hasPlusOne,
      guestName,
    });

    const user = await authRepo.findUserById(userId);
    if (user?.email) {
      const html = renderTemplate("event-registration.html", {
        userName: user.name ?? "there",
        eventName: event.title,
        eventDate: new Date(event.eventDate).toUTCString(),
        eventLocation: event.location,
        hasPlusOne: String(hasPlusOne),
        guestName: guestName ?? "",
      });

      await sendEmail({
        to: user.email,
        subject: `Registration Confirmed: ${event.title}`,
        html,
      }).catch(console.error);
    }

    return {
      code: 201,
      status: "success",
      message: "Registration successful",
      data: { registration },
    };
  } catch (error) {
    console.error("RegisterForEventService error", error);
    return { code: 500, status: "error", message: "Unable to register for event" };
  }
}

export async function CancelRegistrationService(userId: string, eventId: string) {
  try {
    const registration = await registrationRepo.findRegistration(userId, eventId);
    if (!registration) {
      return { code: 404, status: "error", message: "Registration not found" };
    }

    if (registration.status === "CANCELLED") {
      return { code: 400, status: "error", message: "Registration is already cancelled" };
    }

    await registrationRepo.cancelRegistration(userId, eventId);

    const event = await eventRepo.findEventById(eventId);
    const user = await authRepo.findUserById(userId);

    if (user?.email && event) {
      const html = renderTemplate("event-cancellation.html", {
        userName: user.name ?? "there",
        eventName: event.title,
      });

      await sendEmail({
        to: user.email,
        subject: `Registration Cancelled: ${event.title}`,
        html,
      }).catch(console.error);
    }

    return {
      code: 200,
      status: "success",
      message: "Registration cancelled successfully",
    };
  } catch (error) {
    console.error("CancelRegistrationService error", error);
    return { code: 500, status: "error", message: "Unable to cancel registration" };
  }
}

export async function GetRegistrationsByEventService(eventId: string) {
  try {
    const event = await eventRepo.findEventById(eventId);
    if (!event) {
      return { code: 404, status: "error", message: "Event not found" };
    }

    const registrations = await registrationRepo.findRegistrationsByEvent(eventId);
    const confirmedCount = await registrationRepo.countConfirmedRegistrations(eventId);

    return {
      code: 200,
      status: "success",
      data: {
        registrations,
        confirmedCount,
        maxParticipants: event.maxParticipants,
        minParticipants: event.minParticipants,
      },
    };
  } catch (error) {
    console.error("GetRegistrationsByEventService error", error);
    return { code: 500, status: "error", message: "Unable to fetch registrations" };
  }
}

export async function GetRegistrationsByUserService(userId: string) {
  try {
    const registrations = await registrationRepo.findRegistrationsByUser(userId);

    return {
      code: 200,
      status: "success",
      data: { registrations },
    };
  } catch (error) {
    console.error("GetRegistrationsByUserService error", error);
    return { code: 500, status: "error", message: "Unable to fetch registrations" };
  }
}
