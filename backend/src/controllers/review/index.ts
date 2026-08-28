import { Request, Response } from "express";
import { CreateReviewService } from "@/services/review";

export class ReviewController {
  public create = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const { eventId, rating, title, comment } = req.body ?? {};
    const result = await CreateReviewService(userId, { eventId, rating, title, comment });
    return res.status(result.code).json(result);
  };
}
