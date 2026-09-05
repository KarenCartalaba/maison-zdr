"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Calendar, Star, Inbox } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { adminService } from "@/services/admin.service";
import type { AnalyticsOverview } from "@/types";

const registrationTrendConfig = {
  registered: { label: "Registered", color: "#1a5c2a" },
  attended: { label: "Attended", color: "#4ade80" },
} satisfies ChartConfig;

const performanceChartConfig = {
  registrations: { label: "Registrations", color: "#1a5c2a" },
} satisfies ChartConfig;

function LoadingSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-3 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="h-[250px] bg-muted rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="h-[250px] bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">No analytics data available yet</h3>
      <p className="text-sm text-muted-foreground">
        Analytics will appear once you have events and registrations.
      </p>
    </div>
  );
}

interface AnalyticsContentProps {
  initialData?: AnalyticsOverview | null;
}

export default function AnalyticsContent({ initialData = null }: AnalyticsContentProps) {
  const [data, setData] = useState<AnalyticsOverview | null>(initialData);
  const [loading, setLoading] = useState(!initialData);

  const handleExportReport = () => {
    if (!data) return;
    const lines: string[] = [];
    lines.push("Analytics Report");
    lines.push(`Generated,${new Date().toISOString().split("T")[0]}`);
    lines.push("");
    lines.push("Overview");
    lines.push("Metric,Value");
    lines.push(`Total Events,${data.totalEvents}`);
    lines.push(`Total Registrations,${data.totalRegistrations}`);
    lines.push(`Total Users,${data.totalUsers}`);
    lines.push(`Total Reviews,${data.totalReviews}`);
    lines.push(`Average Rating,${data.avgRating.toFixed(1)}`);
    lines.push("");
    if (data.eventPerformance && data.eventPerformance.length > 0) {
      lines.push("Event Performance");
      lines.push("Event,Registrations,Max Participants,Fill Rate,Avg Rating,Reviews");
      data.eventPerformance.forEach((e) => {
        lines.push(
          `"${e.title.replace(/"/g, '""')}",${e.registrations},${e.maxParticipants},${Math.round(e.fillRate)}%,${e.avgRating.toFixed(1)},${e.reviewCount}`
        );
      });
    }
    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `analytics-report-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (initialData) {
      setLoading(false);
      return;
    }
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAnalytics();
        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [initialData]);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <EmptyState />;

  const hasData =
    data.totalEvents > 0 ||
    data.totalRegistrations > 0 ||
    data.totalUsers > 0;

  if (!hasData) return <EmptyState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Event performance and insights
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Total Registrations
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {data.totalRegistrations.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Users</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {data.totalUsers.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Avg. Rating</span>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{data.avgRating.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Events Hosted
              </span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{data.totalEvents}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registration Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data.registrationTrend && data.registrationTrend.length > 0 ? (
              <ChartContainer
                config={registrationTrendConfig}
                className="h-[250px]"
              >
                <AreaChart data={data.registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="registered"
                    stroke="#1a5c2a"
                    fill="#1a5c2a"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="attended"
                    stroke="#4ade80"
                    fill="#4ade80"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {data.eventPerformance && data.eventPerformance.length > 0 ? (
              <ChartContainer
                config={performanceChartConfig}
                className="h-[250px]"
              >
                <BarChart
                  data={data.eventPerformance.map((e) => ({
                    name: e.title,
                    registrations: e.registrations,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="registrations"
                    fill="#1a5c2a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Performance Table */}
      {data.eventPerformance && data.eventPerformance.length > 0 && (
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
                    <th className="px-6 py-3 font-medium">FILL RATE</th>
                    <th className="px-6 py-3 font-medium">AVG. RATING</th>
                    <th className="px-6 py-3 font-medium">REVIEWS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.eventPerformance.map((event, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-6 py-3 font-medium">{event.title}</td>
                      <td className="px-6 py-3">
                        {event.registrations} / {event.maxParticipants}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-[#1a5c2a]"
                              style={{
                                width: `${Math.min(event.fillRate, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(event.fillRate)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span>{event.avgRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {event.reviewCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
