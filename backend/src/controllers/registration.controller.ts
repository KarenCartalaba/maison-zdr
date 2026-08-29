import { Request, Response } from "express";
import { RegisterForEventService, CancelRegistrationService, GetRegistrationsByEventService, GetRegistrationsByUserService } from "@/services/registration";

export class RegistrationController {
  public register = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const { eventId, hasPlusOne, guestName, guestNames, guestCount } = req.body ?? {};

    const result = await RegisterForEventService(userId, eventId, hasPlusOne ?? false, guestName, guestNames, guestCount);
    return res.status(result.code).json(result);
  };

  public cancel = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const { eventId } = req.body ?? {};

    const result = await CancelRegistrationService(userId, eventId);
    return res.status(result.code).json(result);
  };

  public getByEvent = async (req: Request, res: Response) => {
    const eventId = req.params.eventId as string;
    const result = await GetRegistrationsByEventService(eventId);
    return res.status(result.code).json(result);
  };

  public getByUser = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const result = await GetRegistrationsByUserService(userId);
    return res.status(result.code).json(result);
  };
}
