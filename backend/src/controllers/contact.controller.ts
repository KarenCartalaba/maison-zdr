import { Request, Response } from "express";
import { SendContactMessageService } from "@/services/contact";

export class ContactController {
  public sendMessage = async (req: Request, res: Response) => {
    const { name, email, message } = req.body ?? {};
    const result = await SendContactMessageService(name, email, message);
    return res.status(result.code).json(result);
  };
}
