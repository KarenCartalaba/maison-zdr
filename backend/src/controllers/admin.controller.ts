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
  GetAllRegistrationsService,
  UpdateRegistrationStatusService,
  GetAllCheckInEventsService,
  GetEventCheckInService,
  CheckInRegistrationService,
  GetAllReviewsService,
  UpdateReviewStatusService,
  ReplyToReviewService,
  GetAllUsersService,
  UpdateUserRoleService,
  GetAnalyticsOverviewService,
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

  // ==================== Registrations Management ====================

  public getAllRegistrations = async (req: Request, res: Response) => {
    const { status, search, eventId } = req.query as { status?: string; search?: string; eventId?: string };
    const result = await GetAllRegistrationsService({ status, search, eventId });
    return res.status(result.code).json(result);
  };

  public updateRegistrationStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    const result = await UpdateRegistrationStatusService(id, status);
    return res.status(result.code).json(result);
  };

  // ==================== Check-ins ====================

  public getAllCheckInEvents = async (req: Request, res: Response) => {
    const result = await GetAllCheckInEventsService();
    return res.status(result.code).json(result);
  };

  public getEventCheckIn = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GetEventCheckInService(id);
    return res.status(result.code).json(result);
  };

  public checkInRegistration = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CheckInRegistrationService(id);
    return res.status(result.code).json(result);
  };

  // ==================== Reviews Management ====================

  public getAllReviews = async (req: Request, res: Response) => {
    const { status, search } = req.query as { status?: string; search?: string };
    const result = await GetAllReviewsService({ status, search });
    return res.status(result.code).json(result);
  };

  public updateReviewStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    const result = await UpdateReviewStatusService(id, status);
    return res.status(result.code).json(result);
  };

  public replyToReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reply } = req.body ?? {};
    const result = await ReplyToReviewService(id, reply);
    return res.status(result.code).json(result);
  };

  // ==================== Users Management ====================

  public getAllUsers = async (req: Request, res: Response) => {
    const { role, search } = req.query as { role?: string; search?: string };
    const result = await GetAllUsersService({ role, search });
    return res.status(result.code).json(result);
  };

  public updateUserRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body ?? {};
    const result = await UpdateUserRoleService(id, role);
    return res.status(result.code).json(result);
  };

  // ==================== Analytics ====================

  public getAnalyticsOverview = async (req: Request, res: Response) => {
    const result = await GetAnalyticsOverviewService();
    return res.status(result.code).json(result);
  };
}
