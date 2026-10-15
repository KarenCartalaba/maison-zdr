import { Request, Response } from "express";
import { CreateEventService, UpdateEventService, DeleteEventService, GetEventService, GetAllEventsService } from "@/services/event";
import { ReviewRepository } from "@/repositories/review.repository";

const reviewRepo = new ReviewRepository();

export class EventController {
  public createEvent = async (req: Request, res: Response) => {
    const authorId = (req as any).user?.sub;
    const { title, description, location, eventDate, endDate, deadline, minParticipants, maxParticipants, eventType, gallery } = req.body ?? {};

    const result = await CreateEventService({
      title,
      description,
      location,
      eventDate,
      endDate,
      deadline,
      minParticipants,
      maxParticipants,
      authorId,
      eventType,
      gallery,
    });
    return res.status(result.code).json(result);
  };

  public updateEvent = async (req: Request, res: Response) => {
    const { id, title, description, location, eventDate, endDate, deadline, minParticipants, maxParticipants, eventType, isCancelled, gallery } = req.body ?? {};

    const result = await UpdateEventService({
      id,
      title,
      description,
      location,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      minParticipants,
      maxParticipants,
      eventType,
      isCancelled,
      gallery,
    });
    return res.status(result.code).json(result);
  };

  public deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.body ?? {};
    const result = await DeleteEventService(id);
    return res.status(result.code).json(result);
  };

  public getEvent = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await GetEventService(id);
    return res.status(result.code).json(result);
  };

  /** Public catalogue (GET /events/v1/all): cancelled events excluded. */
  public getAllEvents = async (req: Request, res: Response) => {
    const result = await GetAllEventsService({ excludeCancelled: true });
    return res.status(result.code).json(result);
  };

  /** Admin/moderator list (GET /moderator/v1/events): keeps cancelled/past events. */
  public getAllEventsAdmin = async (req: Request, res: Response) => {
    const result = await GetAllEventsService({ excludeCancelled: false });
    return res.status(result.code).json(result);
  };

  public getEventReviews = async (req: Request, res: Response) => {
    const eventId = req.params.id as string;
    try {
      const reviews = await reviewRepo.findApprovedByEvent(eventId);

      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0
        ? Math.round((reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;

      return res.status(200).json({
        code: 200,
        status: "success",
        data: { reviews, averageRating: avgRating, totalReviews },
      });
    } catch (error) {
      console.error("getEventReviews error", error);
      return res.status(500).json({ code: 500, status: "error", message: "Failed to fetch reviews" });
    }
  };
}
