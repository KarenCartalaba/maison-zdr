import { Request, Response } from "express";
import {
  CreateReviewService,
  UpdateOwnReviewService,
  DeleteOwnReviewService,
} from "@/services/review";

export class ReviewController {
  public create = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const { eventId, rating, title, comment } = req.body ?? {};
    const result = await CreateReviewService(userId, { eventId, rating, title, comment });
    return res.status(result.code).json(result);
  };

  // PATCH /api/reviews/v1/:id — edit the caller's own review
  public update = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const reviewId = req.params.id as string;
    const { rating, title, comment } = req.body ?? {};
    const result = await UpdateOwnReviewService(userId, reviewId, {
      rating,
      title,
      comment,
    });
    return res.status(result.code).json(result);
  };

  // DELETE /api/reviews/v1/:id — remove the caller's own review
  public remove = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const reviewId = req.params.id as string;
    const result = await DeleteOwnReviewService(userId, reviewId);
    return res.status(result.code).json(result);
  };
}
