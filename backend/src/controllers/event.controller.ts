import { Request, Response } from "express";
import { CreateEventService, UpdateEventService, DeleteEventService, GetEventService, GetAllEventsService } from "@/services/event";
import { prisma } from "@/lib/prisma";

export class EventController {
  public createEvent = async (req: Request, res: Response) => {
    const authorId = (req as any).user?.sub;
    const { title, description, location, eventDate, deadline, minParticipants, maxParticipants, eventType, gallery } = req.body ?? {};

    const result = await CreateEventService({
      title,
      description,
      location,
      eventDate: new Date(eventDate),
      deadline: new Date(deadline),
      minParticipants,
      maxParticipants,
      authorId,
      eventType,
      gallery,
    });
    return res.status(result.code).json(result);
  };

  public updateEvent = async (req: Request, res: Response) => {
    const { id, title, description, location, eventDate, deadline, minParticipants, maxParticipants, eventType, isCancelled, allowReviewsNow, gallery } = req.body ?? {};

    const result = await UpdateEventService({
      id,
      title,
      description,
      location,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      minParticipants,
      maxParticipants,
      eventType,
      isCancelled,
      allowReviewsNow,
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

  public getAllEvents = async (req: Request, res: Response) => {
    const result = await GetAllEventsService();
    return res.status(result.code).json(result);
  };

  public getEventReviews = async (req: Request, res: Response) => {
    const eventId = req.params.id as string;
    try {
      const reviews = await prisma.review.findMany({
        where: { eventId, status: "APPROVED" },
        include: {
          user: { select: { id: true, name: true, profilePic: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
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
