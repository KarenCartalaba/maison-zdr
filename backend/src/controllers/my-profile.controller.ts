import { Request, Response } from "express";
import { MyRegistrationsService } from "@/services/auth/my-registrations-service";
import { ProfileStatsService } from "@/services/auth/profile-stats-service";
import { MyReviewsService } from "@/services/auth/my-reviews-service";
import { PendingReviewsService } from "@/services/auth/pending-reviews-service";

export class MyProfileController {
  public getMyRegistrations = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const result = await MyRegistrationsService(userId);
    return res.status(result.code).json(result);
  };

  public getProfileStats = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const result = await ProfileStatsService(userId);
    return res.status(result.code).json(result);
  };

  public getMyReviews = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const result = await MyReviewsService(userId);
    return res.status(result.code).json(result);
  };

  public getPendingReviews = async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub;
    const result = await PendingReviewsService(userId);
    return res.status(result.code).json(result);
  };
}
