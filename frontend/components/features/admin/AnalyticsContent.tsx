"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const monthlyRevenueData = [
  { month: "Feb", revenue: 4200, target: 5000 },
  { month: "Mar", revenue: 5800, target: 5000 },
  { month: "Apr", revenue: 4900, target: 5500 },
  { month: "May", revenue: 8200, target: 6000 },
  { month: "Jun", revenue: 9500, target: 7000 },
  { month: "Jul", revenue: 11000, target: 8000 },
  { month: "Aug", revenue: 8800, target: 8500 },
];

const eventPerformanceData = [
  { name: "Acoustic Friday", registrations: 238, revenue: 4760, rating: 4.6 },
  { name: "Cocktail Night", registrations: 142, revenue: 5680, rating: 4.7 },
  { name: "Trivia Hour", registrations: 116, revenue: 1160, rating: 4.4 },
  { name: "Wine Tasting", registrations: 89, revenue: 6230, rating: 4.8 },
  { name: "Comedy Night", registrations: 156, revenue: 3120, rating: 4.5 },
];

const peakHoursData = [
  { hour: "18:00", guests: 20 },
  { hour: "19:00", guests: 45 },
  { hour: "20:00", guests: 85 },
  { hour: "21:00", guests: 120 },
  { hour: "22:00", guests: 140 },
  { hour: "23:00", guests: 110 },
  { hour: "00:00", guests: 60 },
];

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "#1a5c2a" },
  target: { label: "Target", color: "#d1d5db" },
} satisfies ChartConfig;

const performanceChartConfig = {
  registrations: { label: "Registrations", color: "#1a5c2a" },
  revenue: { label: "Revenue", color: "#4ade80" },
} satisfies ChartConfig;

const peakHoursChartConfig = {
  guests: { label: "Guests", color: "#1a5c2a" },
} satisfies ChartConfig;

export default function AnalyticsContent() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Event performance and revenue insights</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Revenue</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">€52,400</p>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +18% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Avg. Attendance Rate</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">78%</p>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +5% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Events Hosted</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">48</p>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +12% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Repeat Guests</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">42%</p>
            <p className="text-xs text-[#1a5c2a] mt-1">▲ +8% vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[250px]">
              <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#1a5c2a" fill="#1a5c2a" fillOpacity={0.1} strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={peakHoursChartConfig} className="h-[250px]">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="guests" fill="#1a5c2a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Event Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">EVENT</th>
                  <th className="px-6 py-3 font-medium">REGISTRATIONS</th>
                  <th className="px-6 py-3 font-medium">REVENUE</th>
                  <th className="px-6 py-3 font-medium">AVG. RATING</th>
                  <th className="px-6 py-3 font-medium">FILL RATE</th>
                </tr>
              </thead>
              <tbody>
                {eventPerformanceData.map((event, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-3 font-medium">{event.name}</td>
                    <td className="px-6 py-3">{event.registrations}</td>
                    <td className="px-6 py-3">€{event.revenue.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span>{event.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[#1a5c2a]" style={{ width: `${(event.registrations / 250) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{Math.round((event.registrations / 250) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
