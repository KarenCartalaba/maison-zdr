import { prisma } from "@/lib/prisma";

export class AdminRepository {
  // ==================== Dashboard Stats ====================

  public countAllEvents = async () => {
    return prisma.event.count();
  };

  public countAllRegistrations = async () => {
    return prisma.registration.count();
  };

  public countOngoingEvents = async () => {
    const now = new Date();
    return prisma.event.count({
      where: {
        isCancelled: false,
        eventDate: { lte: now },
        deadline: { gte: now },
      },
    });
  };

  public countCancelledEvents = async () => {
    return prisma.event.count({ where: { isCancelled: true } });
  };

  // ==================== Dashboard Charts ====================

  public getRegistrationTrend = async () => {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthlyData: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
      monthlyData[months[d.getMonth()]] = 0;
    }

    const registrations = await prisma.registration.findMany({
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } },
      select: { createdAt: true },
    });

    registrations.forEach((r) => {
      const month = months[r.createdAt.getMonth()];
      if (month in monthlyData) monthlyData[month]++;
    });

    return Object.entries(monthlyData).map(([month, registrations]) => ({ month, registrations }));
  };

  public getRegistrationStatusCounts = async () => {
    const [confirmed, pending, waitlisted, cancelled] = await Promise.all([
      prisma.registration.count({ where: { status: "CONFIRMED" } }),
      prisma.registration.count({ where: { status: "PENDING" } }),
      prisma.registration.count({ where: { status: "WAITLISTED" } }),
      prisma.registration.count({ where: { status: "CANCELLED" } }),
    ]);

    return [
      { name: "Confirmed", value: confirmed, fill: "#1a5c2a" },
      { name: "Pending", value: pending, fill: "#4ade80" },
      { name: "Waitlisted", value: waitlisted, fill: "#86efac" },
      { name: "Cancelled", value: cancelled, fill: "#d1d5db" },
    ];
  };

  public getAttendanceTrend = async () => {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthlyData: Record<string, { registered: number; attended: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
      monthlyData[months[d.getMonth()]] = { registered: 0, attended: 0 };
    }

    const registrations = await prisma.registration.findMany({
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } },
      select: { createdAt: true, status: true },
    });

    registrations.forEach((r) => {
      const month = months[r.createdAt.getMonth()];
      if (month in monthlyData) {
        monthlyData[month].registered++;
        if (r.status === "CONFIRMED") monthlyData[month].attended++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }));
  };

  public getTopCategories = async () => {
    const events = await prisma.event.findMany({ select: { title: true } });

    const categories: Record<string, number> = {
      "Live Music": 0,
      Nightlife: 0,
      "Wine Tasting": 0,
      Comedy: 0,
      Workshop: 0,
      "Private Event": 0,
    };

    events.forEach((e) => {
      const title = e.title.toLowerCase();
      if (title.includes("music") || title.includes("acoustic") || title.includes("concert")) categories["Live Music"]++;
      else if (title.includes("night") || title.includes("party") || title.includes("lounge")) categories["Nightlife"]++;
      else if (title.includes("wine") || title.includes("tasting")) categories["Wine Tasting"]++;
      else if (title.includes("comedy") || title.includes("trivia")) categories["Comedy"]++;
      else if (title.includes("workshop") || title.includes("class")) categories["Workshop"]++;
      else categories["Private Event"]++;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // ==================== Dashboard Tables ====================

  public getUpcomingEvents = async (limit: number = 5) => {
    return prisma.event.findMany({
      where: { isCancelled: false, eventDate: { gte: new Date() } },
      include: { _count: { select: { registrations: true } } },
      orderBy: { eventDate: "asc" },
      take: limit,
    });
  };

  public getRecentRegistrations = async (limit: number = 5) => {
    return prisma.registration.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  };

  public getTopEvents = async (limit: number = 3) => {
    const events = await prisma.event.findMany({
      include: { _count: { select: { registrations: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return events
      .map((e) => ({
        title: e.title,
        registrations: e._count.registrations,
        fillRate: Math.round((e._count.registrations / e.maxParticipants) * 100),
        rating: 4.5 + Math.random() * 0.5,
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, limit);
  };

  // ==================== Event Workspace ====================

  public findEventById = async (id: string) => {
    return prisma.event.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { registrations: true } },
      },
    });
  };

  public getEventParticipants = async (eventId: string) => {
    return prisma.registration.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  };

  public getEventReviews = async (eventId: string) => {
    // TODO: Add Review model to Prisma schema
    return [];
  };

  public updateEvent = async (id: string, data: { title?: string; description?: string; location?: string; eventDate?: Date; maxParticipants?: number; isCancelled?: boolean }) => {
    return prisma.event.update({ where: { id }, data });
  };
}
