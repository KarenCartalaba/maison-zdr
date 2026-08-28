import { Request, Response } from "express";
import {
  GetDashboardStatsService,
  GetRegistrationTrendService,
  GetRegistrationStatusService,
  GetAttendanceTrendService,
  GetTopCategoriesService,
  GetUpcomingEventsService,
  GetRecentRegistrationsService,
  GetTopEventsService,
  GetEventWorkspaceService,
  GetEventParticipantsService,
  GetEventReviewsService,
  UpdateEventService,
} from "@/services/admin";

export class AdminController {
  // ==================== Dashboard Stats ====================

  public getDashboardStats = async (req: Request, res: Response) => {
    const result = await GetDashboardStatsService();
    return res.status(result.code).json(result);
  };

  // ==================== Dashboard Charts ====================

  public getRegistrationTrend = async (req: Request, res: Response) => {
    const result = await GetRegistrationTrendService();
    return res.status(result.code).json(result);
  };

  public getRegistrationStatus = async (req: Request, res: Response) => {
    const result = await GetRegistrationStatusService();
    return res.status(result.code).json(result);
  };

  public getAttendanceTrend = async (req: Request, res: Response) => {
    const result = await GetAttendanceTrendService();
    return res.status(result.code).json(result);
  };

  public getTopCategories = async (req: Request, res: Response) => {
    const result = await GetTopCategoriesService();
    return res.status(result.code).json(result);
  };

  // ==================== Dashboard Tables ====================

  public getUpcomingEvents = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await GetUpcomingEventsService(limit);
    return res.status(result.code).json(result);
  };

  public getRecentRegistrations = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await GetRecentRegistrationsService(limit);
    return res.status(result.code).json(result);
  };

  public getTopEvents = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await GetTopEventsService(limit);
    return res.status(result.code).json(result);
  };

  // ==================== Event Workspace ====================

  public getEventWorkspace = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GetEventWorkspaceService(id);
    return res.status(result.code).json(result);
  };

  public getEventParticipants = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GetEventParticipantsService(id);
    return res.status(result.code).json(result);
  };

  public getEventReviews = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GetEventReviewsService(id);
    return res.status(result.code).json(result);
  };

  public updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, location, eventDate, maxParticipants, isCancelled } = req.body ?? {};
    const result = await UpdateEventService(id, {
      title,
      description,
      location,
      eventDate,
      maxParticipants,
      isCancelled,
    });
    return res.status(result.code).json(result);
  };
}
