"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const registrationTrendData = [
  { month: "Feb", registrations: 180 },
  { month: "Mar", registrations: 220 },
  { month: "Apr", registrations: 190 },
  { month: "May", registrations: 350 },
  { month: "Jun", registrations: 400 },
  { month: "Jul", registrations: 450 },
  { month: "Aug", registrations: 380 },
];

const registrationStatusData = [
  { name: "Confirmed", value: 1428, fill: "#1a5c2a" },
  { name: "Pending", value: 264, fill: "#4ade80" },
  { name: "Waitlisted", value: 112, fill: "#86efac" },
  { name: "Cancelled", value: 86, fill: "#d1d5db" },
];

const attendanceData = [
  { month: "Feb", registered: 180, attended: 150 },
  { month: "Mar", registered: 220, attended: 180 },
  { month: "Apr", registered: 190, attended: 160 },
  { month: "May", registered: 350, attended: 280 },
  { month: "Jun", registered: 400, attended: 320 },
  { month: "Jul", registered: 450, attended: 380 },
  { month: "Aug", registered: 380, attended: 300 },
];

const topCategoriesData = [
  { name: "Live Music", value: 420 },
  { name: "Nightlife", value: 380 },
  { name: "Wine Tasting", value: 280 },
  { name: "Comedy", value: 200 },
  { name: "Workshop", value: 120 },
  { name: "Private Event", value: 80 },
];

const upcomingEvents = [
  { id: "1", title: "Acoustic Friday", date: "Oct 24, 20:00", participants: "180 / 200", status: "Upcoming", image: "/images/event-1.jpg" },
  { id: "2", title: "Cocktail Night", date: "Oct 26, 21:30", participants: "42 / 50", status: "Upcoming", image: "/images/event-2.jpg" },
  { id: "3", title: "Trivia Hour", date: "Oct 26, 21:30", participants: "42 / 50", status: "Upcoming", image: "/images/event-3.jpg" },
];

const recentRegistrations = [
  { id: "1", ref: "MZ-8F4A21", name: "Amara Villanueva", email: "amara.v@gmail.com", event: "Acoustic Friday", date: "Oct 26, 21:30", status: "Upcoming" },
  { id: "2", ref: "MZ-8F4A21", name: "Noel Baptiste", email: "noel.baptiste@gmail.com", event: "Acoustic Friday", date: "Oct 26, 21:30", status: "Upcoming" },
  { id: "3", ref: "MZ-8F4A21", name: "Priya Raghavan", email: "priya.r@gmail.com", event: "Acoustic Friday", date: "Oct 26, 21:30", status: "Upcoming" },
];

const topEvents = [
  { title: "Acoustic Friday", registrations: 238, fillRate: 88, rating: 4.6 },
  { title: "Cocktail Night", registrations: 142, fillRate: 79, rating: 4.7 },
  { title: "Trivia Hour", registrations: 116, fillRate: 97, rating: 4.4 },
];

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

export default function DashboardContent() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground">Admin panel · Friday, August 7, 2026</p>
          <h1 className="text-3xl font-bold">Welcome back, Aurel Baz</h1>
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
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Events</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">48</div>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +12% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Registrations</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">2,480</div>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +45% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ongoing Events</span>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Live at Bar & Lounge</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cancelled Events</span>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">1</div>
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
            <p className="text-sm text-muted-foreground">Monthly registrations against target.</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={registrationChartConfig} className="h-[250px]">
              <LineChart data={registrationTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="registrations" stroke="#1a5c2a" strokeWidth={2} dot={false} />
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
              <ChartContainer config={statusChartConfig} className="h-[180px] w-[180px]">
                <PieChart>
                  <Pie data={registrationStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                    {registrationStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold">1,890</span>
              <p className="text-sm text-muted-foreground">Registrations</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1a5c2a]" />
                <span className="text-muted-foreground">Confirmed</span>
                <span className="ml-auto font-medium">1,428</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                <span className="text-muted-foreground">Pending</span>
                <span className="ml-auto font-medium">264</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#86efac]" />
                <span className="text-muted-foreground">Waitlisted</span>
                <span className="ml-auto font-medium">112</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#d1d5db]" />
                <span className="text-muted-foreground">Cancelled</span>
                <span className="ml-auto font-medium">86</span>
              </div>
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
            <p className="text-sm text-muted-foreground">Registered vs actually checked in</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-[250px]">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="registered" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attended" fill="#1a5c2a" radius={[4, 4, 0, 0]} />
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
            <ChartContainer config={categoryChartConfig} className="h-[250px]">
              <BarChart data={topCategoriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#1a5c2a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Upcoming & Active Events Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Cover</th>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Participants</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event) => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="px-6 py-3">
                      <div className="h-10 w-14 rounded overflow-hidden bg-muted">
                        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium">{event.title}</td>
                    <td className="px-6 py-3 text-muted-foreground">{event.date}</td>
                    <td className="px-6 py-3 text-muted-foreground">{event.participants}</td>
                    <td className="px-6 py-3">
                      <Badge variant="outline" className="text-[#1a5c2a] border-[#1a5c2a]">{event.status}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Button variant="ghost" size="sm">···</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">REFERENCE NO.</th>
                  <th className="px-6 py-3 font-medium">PARTICIPANT</th>
                  <th className="px-6 py-3 font-medium">Event</th>
                  <th className="px-6 py-3 font-medium">REGISTRATION DATE</th>
                  <th className="px-6 py-3 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-b last:border-0">
                    <td className="px-6 py-3 font-mono font-medium">{reg.ref}</td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium">{reg.name}</p>
                        <p className="text-xs text-muted-foreground">{reg.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{reg.event}</td>
                    <td className="px-6 py-3 text-muted-foreground">{reg.date}</td>
                    <td className="px-6 py-3">
                      <Badge variant="outline" className="text-[#1a5c2a] border-[#1a5c2a]">{reg.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                        <span key={j} className={`text-xs ${j < Math.round(event.rating) ? "text-yellow-400" : "text-muted"}`}>★</span>
                      ))}
                    </div>
                    <span className="text-sm font-medium">{event.rating}</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[#1a5c2a]" style={{ width: `${event.fillRate}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{event.registrations} registrations · {event.fillRate}% fill rate</p>
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
