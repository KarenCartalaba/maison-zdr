import { Request, Response } from "express";
import { SendContactMessageService, GetContactMessagesService } from "@/services/contact";

export class ContactController {
  public sendMessage = async (req: Request, res: Response) => {
    const { name, email, message } = req.body ?? {};
    const result = await SendContactMessageService(name, email, message);
    return res.status(result.code).json(result);
  };

  /** Admin inbox: list persisted contact-form submissions, newest first. */
  public listMessages = async (req: Request, res: Response) => {
    const { search } = req.query as { search?: string };
    const result = await GetContactMessagesService({ search });
    return res.status(result.code).json(result);
  };
}
