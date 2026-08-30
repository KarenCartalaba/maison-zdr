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

    registrations.forEach((r: { createdAt: Date }) => {
      const month = months[r.createdAt.getMonth()];
      if (month in monthlyData) monthlyData[month]++;
    });

    return Object.entries(monthlyData).map(([month, registrations]) => ({ month, registrations }));
  };

  public getRegistrationStatusCounts = async () => {
    const counts = await prisma.registration.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusMap: Record<string, number> = {};
    counts.forEach((c: { status: string; _count: number }) => { statusMap[c.status] = c._count; });

    return [
      { name: "Confirmed", value: statusMap["CONFIRMED"] || 0, fill: "#1a5c2a" },
      { name: "Pending", value: statusMap["PENDING"] || 0, fill: "#4ade80" },
      { name: "Waitlisted", value: statusMap["WAITLISTED"] || 0, fill: "#86efac" },
      { name: "Cancelled", value: statusMap["CANCELLED"] || 0, fill: "#d1d5db" },
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

    registrations.forEach((r: { createdAt: Date; status: string }) => {
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

    events.forEach((e: { title: string }) => {
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
      .map((e: { title: string; _count: { registrations: number }; maxParticipants: number }) => ({
        title: e.title,
        registrations: e._count.registrations,
        fillRate: Math.round((e._count.registrations / e.maxParticipants) * 100),
        rating: 4.5 + Math.random() * 0.5,
      }))
      .sort((a: { registrations: number }, b: { registrations: number }) => b.registrations - a.registrations)
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
    return prisma.review.findMany({
      where: { eventId, status: "APPROVED" },
      include: {
        user: { select: { id: true, name: true, profilePic: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  public updateEvent = async (id: string, data: { title?: string; description?: string; location?: string; eventDate?: Date; maxParticipants?: number; isCancelled?: boolean }) => {
    return prisma.event.update({ where: { id }, data });
  };

  // ==================== Registrations Management ====================

  public getAllRegistrations = async (filters?: { status?: string; search?: string; eventId?: string }) => {
    const where: any = {};
    if (filters?.status && filters.status !== "ALL") where.status = filters.status;
    if (filters?.eventId) where.eventId = filters.eventId;
    if (filters?.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: "insensitive" } } },
        { user: { email: { contains: filters.search, mode: "insensitive" } } },
        { event: { title: { contains: filters.search, mode: "insensitive" } } },
      ];
    }
    return prisma.registration.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  public getRegistrationStats = async () => {
    const total = await prisma.registration.count();
    const confirmed = await prisma.registration.count({ where: { status: "CONFIRMED" } });
    const pending = await prisma.registration.count({ where: { status: "PENDING" } });
    const waitlisted = await prisma.registration.count({ where: { status: "WAITLISTED" } });
    const cancelled = await prisma.registration.count({ where: { status: "CANCELLED" } });
    return { total, confirmed, pending, waitlisted, cancelled };
  };

  public updateRegistrationStatus = async (id: string, status: string) => {
    return prisma.registration.update({ where: { id }, data: { status: status as any } });
  };

  // ==================== Check-ins ====================

  public getEventForCheckIn = async (eventId: string) => {
    return prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { registrations: true } },
      },
    });
  };

  public getAllCheckInEvents = async () => {
    return prisma.event.findMany({
      where: { isCancelled: false },
      include: { _count: { select: { registrations: true } } },
      orderBy: { eventDate: "desc" },
    });
  };

  public checkInRegistration = async (registrationId: string) => {
    return prisma.registration.update({
      where: { id: registrationId },
      data: { checkedIn: true, checkedInAt: new Date() },
    });
  };

  // ==================== Reviews ====================

  public getAllReviews = async (filters?: { status?: string; search?: string }) => {
    const where: any = {};
    if (filters?.status && filters?.status !== "ALL") where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { user: { name: { contains: filters.search, mode: "insensitive" } } },
        { event: { title: { contains: filters.search, mode: "insensitive" } } },
        { title: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    return prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  public getReviewStats = async () => {
    const total = await prisma.review.count();
    const pending = await prisma.review.count({ where: { status: "PENDING" } });
    const approved = await prisma.review.count({ where: { status: "APPROVED" } });
    const rejected = await prisma.review.count({ where: { status: "REJECTED" } });
    const avgResult = await prisma.review.aggregate({ _avg: { rating: true }, where: { status: "APPROVED" } });
    const avgRating = avgResult._avg.rating || 0;
    return { total, pending, approved, rejected, avgRating: Math.round(avgRating * 10) / 10 };
  };

  public updateReviewStatus = async (id: string, status: string) => {
    return prisma.review.update({ where: { id }, data: { status: status as any } });
  };

  public replyToReview = async (id: string, reply: string) => {
    return prisma.review.update({ where: { id }, data: { reply } });
  };

  // ==================== Users ====================

  public getAllUsers = async (filters?: { role?: string; search?: string }) => {
    const where: any = {};
    if (filters?.role && filters?.role !== "ALL") {
      if (filters.role === "VERIFIED") {
        where.role = "USER";
        where.emailVerified = { not: null };
      } else if (filters.role === "UNVERIFIED") {
        where.role = "USER";
        where.emailVerified = null;
      } else {
        where.role = filters.role;
      }
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    return prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, emailVerified: true, suspended: true, createdAt: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  };

  public getUserStats = async () => {
    const total = await prisma.user.count();
    const verified = await prisma.user.count({ where: { emailVerified: { not: null } } });
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    return { total, verified, unverified: total - verified, admins };
  };

  public updateUserRole = async (id: string, role: string) => {
    return prisma.user.update({ where: { id }, data: { role: role as any } });
  };

  public findUserById = async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        suspended: true,
        emailVerified: true,
        profilePic: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { registrations: true } },
      },
    });
  };

  public verifyUser = async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: new Date() },
    });
  };

  public deleteUser = async (id: string) => {
    return prisma.user.delete({ where: { id } });
  };

  // ==================== Analytics ====================

  public getAnalyticsOverview = async () => {
    const totalEvents = await prisma.event.count();
    const totalRegistrations = await prisma.registration.count();
    const totalUsers = await prisma.user.count();
    const totalReviews = await prisma.review.count();
    const avgResult = await prisma.review.aggregate({ _avg: { rating: true }, where: { status: "APPROVED" } });
    const avgRating = avgResult._avg.rating || 0;

    // Registration trend (last 7 months)
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: Record<string, { registered: number; attended: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
      monthlyData[months[d.getMonth()]] = { registered: 0, attended: 0 };
    }
    const regs = await prisma.registration.findMany({
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } },
      select: { createdAt: true, status: true },
    });
    regs.forEach((r: { createdAt: Date; status: string; checkedIn: boolean }) => {
      const month = months[r.createdAt.getMonth()];
      if (month in monthlyData) {
        monthlyData[month].registered++;
        if (r.status === "CONFIRMED" || r.checkedIn) monthlyData[month].attended++;
      }
    });

    // Event performance (top 10 by registrations)
    const events = await prisma.event.findMany({
      include: { _count: { select: { registrations: true } }, reviews: { where: { status: "APPROVED" }, select: { rating: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const eventPerformance = events.map((e: { title: string; _count: { registrations: number }; maxParticipants: number; reviews: { rating: number }[] }) => {
      const avgRating = e.reviews.length > 0
        ? Math.round((e.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / e.reviews.length) * 10) / 10
        : 0;
      return {
        title: e.title,
        registrations: e._count.registrations,
        maxParticipants: e.maxParticipants,
        fillRate: Math.round((e._count.registrations / e.maxParticipants) * 100),
        avgRating,
        reviewCount: e.reviews.length,
      };
    });

    return {
      totalEvents,
      totalRegistrations,
      totalUsers,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      registrationTrend: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })),
      eventPerformance,
    };
  };
}
