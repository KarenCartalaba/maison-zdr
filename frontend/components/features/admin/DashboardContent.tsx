"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventImage from "@/components/ui/event-image";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Calendar,
  Users,
  PlayCircle,
  XCircle,
  Plus,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { adminService } from "@/services/admin.service";

// Chart configs
const registrationChartConfig = {
  registrations: { label: "Registrations", color: "#1a5c2a" },
} satisfies ChartConfig;

const statusChartConfig = {
  Confirmed: { label: "Confirmed", color: "#1a5c2a" },
  Pending: { label: "Pending", color: "#4ade80" },
  Waitlisted: { label: "Waitlisted", color: "#86efac" },
  Cancelled: { label: "Cancelled", color: "#d1d5db" },
} satisfies ChartConfig;

const attendanceChartConfig = {
  registered: { label: "Registered", color: "#d1d5db" },
  attended: { label: "Attended", color: "#1a5c2a" },
} satisfies ChartConfig;

const categoryChartConfig = {
  value: { label: "Registrations", color: "#1a5c2a" },
} satisfies ChartConfig;

// TanStack Table columns for Upcoming Events
const upcomingColumns: DataTableColumn[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-14 rounded overflow-hidden">
          <EventImage src={row.original.gallery?.[0]} title={row.original.title} className="h-10 w-14 rounded" />
        </div>
        <span className="font-medium">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: "eventDate",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.eventDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    id: "participants",
    header: "Participants",
    cell: ({ row }) =>
      `${row.original._count?.registrations || 0} / ${row.original.maxParticipants}`,
  },
  {
    accessorKey: "isCancelled",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.isCancelled
            ? "text-red-500 border-red-500"
            : "text-[#1a5c2a] border-[#1a5c2a]"
        }
      >
        {row.original.isCancelled ? "Cancelled" : "Upcoming"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => <Button variant="ghost" size="sm">···</Button>,
  },
];

// TanStack Table columns for Recent Registrations
const recentColumns: DataTableColumn[] = [
  {
    id: "referenceNumber",
    header: "REFERENCE NO.",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {row.original.referenceNumber || `MZ-${row.original.id.slice(0, 6).toUpperCase()}`}
      </span>
    ),
  },
  {
    id: "participant",
    header: "PARTICIPANT",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.user?.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.user?.email}
        </p>
      </div>
    ),
  },
  {
    id: "event",
    header: "Event",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.event?.title}
      </span>
    ),
  },
  {
    id: "createdAt",
    header: "REGISTRATION DATE",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
  {
    id: "status",
    header: "STATUS",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="text-[#1a5c2a] border-[#1a5c2a]"
      >
        {row.original.status}
      </Badge>
    ),
  },
];

interface DashboardContentProps {
  initialStats?: {
    totalEvents: number;
    totalRegistrations: number;
    ongoingEvents: number;
    cancelledEvents: number;
  } | null;
  initialTrend?: { trend: { month: string; registrations: number }[] } | null;
  initialStatus?: { status: { name: string; value: number; fill: string }[] } | null;
  initialAttendance?: { trend: { month: string; registered: number; attended: number }[] } | null;
  initialCategories?: { categories: { name: string; value: number }[] } | null;
  initialUpcoming?: { events: any[] } | null;
  initialRecent?: { registrations: any[] } | null;
  initialTop?: { events: { title: string; registrations: number; fillRate: number; rating: number }[] } | null;
}

export default function DashboardContent({
  initialStats = null,
  initialTrend = null,
  initialStatus = null,
  initialAttendance = null,
  initialCategories = null,
  initialUpcoming = null,
  initialRecent = null,
  initialTop = null,
}: DashboardContentProps) {
  const [stats, setStats] = useState(initialStats);
  const [registrationTrend, setRegistrationTrend] = useState<{ month: string; registrations: number }[]>(
    initialTrend?.trend ?? []
  );
  const [registrationStatus, setRegistrationStatus] = useState<{ name: string; value: number; fill: string }[]>(
    initialStatus?.status ?? []
  );
  const [attendanceTrend, setAttendanceTrend] = useState<{ month: string; registered: number; attended: number }[]>(
    initialAttendance?.trend ?? []
  );
  const [topCategories, setTopCategories] = useState<{ name: string; value: number }[]>(
    initialCategories?.categories ?? []
  );
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>(
    initialUpcoming?.events ?? []
  );
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>(
    initialRecent?.registrations ?? []
  );
  const [topEvents, setTopEvents] = useState<{ title: string; registrations: number; fillRate: number; rating: number }[]>(
    initialTop?.events ?? []
  );
  const [loading, setLoading] = useState(
    !initialStats
  );

  // Always reflect the latest server data (e.g. after a delete + refresh)
  useEffect(() => {
    setStats(initialStats);
    setRegistrationTrend(initialTrend?.trend ?? []);
    setRegistrationStatus(initialStatus?.status ?? []);
    setAttendanceTrend(initialAttendance?.trend ?? []);
    setTopCategories(initialCategories?.categories ?? []);
    setUpcomingEvents(initialUpcoming?.events ?? []);
    setRecentRegistrations(initialRecent?.registrations ?? []);
    setTopEvents(initialTop?.events ?? []);
    setLoading(false);
  }, [initialStats, initialTrend, initialStatus, initialAttendance, initialCategories, initialUpcoming, initialRecent, initialTop]);

  useEffect(() => {
    if (initialStats) {
      setLoading(false);
      return;
    }
    async function fetchDashboard() {
      try {
        const [
          statsRes,
          trendRes,
          statusRes,
          attendanceRes,
          categoriesRes,
          upcomingRes,
          recentRes,
          topRes,
        ] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRegistrationTrend(),
          adminService.getRegistrationStatus(),
          adminService.getAttendanceTrend(),
          adminService.getTopCategories(),
          adminService.getUpcomingEvents(5),
          adminService.getRecentRegistrations(5),
          adminService.getTopEvents(5),
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (trendRes.data) setRegistrationTrend(trendRes.data.trend);
        if (statusRes.data) setRegistrationStatus(statusRes.data.status);
        if (attendanceRes.data) setAttendanceTrend(attendanceRes.data.trend);
        if (categoriesRes.data) setTopCategories(categoriesRes.data.categories);
        if (upcomingRes.data) setUpcomingEvents(upcomingRes.data.events);
        if (recentRes.data) setRecentRegistrations(recentRes.data.registrations);
        if (topRes.data) setTopEvents(topRes.data.events);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [initialStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a5c2a] border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalStatusRegistrations = registrationStatus.reduce(
    (acc, s) => acc + s.value,
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground">
            Admin panel ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
          <Link href="/admin/events/create">
            <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Venue Operations Live Feed */}
      <h2 className="text-lg font-semibold mb-4">Venue Operations Live Feed</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Events
              </span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{stats?.totalEvents ?? "—"}</div>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +12% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Registrations
              </span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">
              {stats?.totalRegistrations ?? "—"}
            </div>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +45% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ongoing Events
              </span>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">
              {stats?.ongoingEvents ?? "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live at Bar & Lounge
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cancelled Events
              </span>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">
              {stats?.cancelledEvents ?? "—"}
            </div>
            <p className="text-xs text-red-500 mt-1">▼ 2% vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Registration Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Registration trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly registrations against target.
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={registrationChartConfig}
              className="h-[250px]"
            >
              <LineChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#1a5c2a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Registration Status Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registration status</CardTitle>
            <p className="text-sm text-muted-foreground">Across all events</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <ChartContainer
                config={statusChartConfig}
                className="h-[180px] w-[180px]"
              >
                <PieChart>
                  <Pie
                    data={registrationStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {registrationStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold">
                {totalStatusRegistrations.toLocaleString()}
              </span>
              <p className="text-sm text-muted-foreground">Registrations</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {registrationStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Attendance trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              Registered vs actually checked in
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={attendanceChartConfig}
              className="h-[250px]"
            >
              <BarChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="registered"
                  fill="#d1d5db"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="attended"
                  fill="#1a5c2a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Event Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top event categories</CardTitle>
            <p className="text-sm text-muted-foreground">By registrations</p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={categoryChartConfig}
              className="h-[250px]"
            >
              <BarChart data={topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="#1a5c2a"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Table (TanStack Table) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">
            Upcoming & Active Events Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={upcomingColumns} data={upcomingEvents} />
        </CardContent>
      </Card>

      {/* Recent Registrations Table (TanStack Table) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={recentColumns} data={recentRegistrations} />
        </CardContent>
      </Card>

      {/* Bottom Row: Top Events + Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Events</CardTitle>
            <p className="text-sm text-muted-foreground">Fill rate and rating</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {topEvents.map((event, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{event.title}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={`text-xs ${
                            j < Math.round(event.rating)
                              ? "text-yellow-400"
                              : "text-muted"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-medium">{event.rating}</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[#1a5c2a]"
                    style={{ width: `${event.fillRate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.registrations} registrations · {event.fillRate}% fill
                  rate
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fast Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fast Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { label: "Create Event", href: "/admin/events/create" },
              { label: "Manage Users", href: "/admin/users" },
              { label: "Export Analytics", href: "/admin/analytics" },
              { label: "View Today's Check-ins", href: "/admin/check-ins" },
              { label: "Pending Reviews", href: "/admin/reviews" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <span>{action.label}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
