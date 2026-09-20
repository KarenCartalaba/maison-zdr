"use client";

import { useEffect, useMemo, useState } from "react";
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
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { adminService } from "@/services/admin.service";
import { useLanguage } from "@/context/LanguageContext";
import type { AnalyticsOverview } from "@/types";

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

function EmptyState({ t }: { t: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">{t.adminAnalytics.emptyTitle}</h3>
      <p className="text-sm text-muted-foreground">
        {t.adminAnalytics.emptyDesc}
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
  const { t, dateLocale } = useLanguage();

  const performanceColumns: DataTableColumn[] = useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminAnalytics.colEvent} />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      id: "registrations",
      header: t.adminAnalytics.colRegistrations,
      cell: ({ row }) => (
        <span>
          {row.original.registrations.toLocaleString(dateLocale)} / {row.original.maxParticipants.toLocaleString(dateLocale)}
        </span>
      ),
    },
    {
      id: "fillRate",
      header: t.adminAnalytics.colFillRate,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#1a5c2a]"
              style={{
                width: `${Math.min(row.original.fillRate, 100)}%`,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {Math.round(row.original.fillRate)}%
          </span>
        </div>
      ),
    },
    {
      id: "avgRating",
      header: t.adminAnalytics.colAvgRating,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          <span>{row.original.avgRating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      accessorKey: "reviewCount",
      header: t.adminAnalytics.colReviews,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.reviewCount.toLocaleString(dateLocale)}</span>
      ),
    },
  ], [t, dateLocale]);

  const registrationTrendConfig = useMemo(() => ({
    registered: { label: t.adminAnalytics.chartRegistered, color: "#1a5c2a" },
    attended: { label: t.adminAnalytics.chartAttended, color: "#4ade80" },
  } satisfies ChartConfig), [t]);

  const performanceChartConfig = useMemo(() => ({
    registrations: { label: t.adminAnalytics.chartRegistrations, color: "#1a5c2a" },
  } satisfies ChartConfig), [t]);

  // Always reflect the latest server data
  useEffect(() => {
    setData(initialData);
    setLoading(false);
  }, [initialData]);

  const handleExportReport = () => {
    if (!data) return;
    const lines: string[] = [];
    lines.push(t.adminAnalytics.csvReportTitle);
    lines.push(`${t.adminAnalytics.csvGenerated},${new Date().toISOString().split("T")[0]}`);
    lines.push("");
    lines.push(t.adminAnalytics.csvOverview);
    lines.push(`${t.adminAnalytics.csvMetric},${t.adminAnalytics.csvValue}`);
    lines.push(`${t.adminAnalytics.csvTotalEvents},${data.totalEvents}`);
    lines.push(`${t.adminAnalytics.csvTotalRegistrations},${data.totalRegistrations}`);
    lines.push(`${t.adminAnalytics.csvTotalUsers},${data.totalUsers}`);
    lines.push(`${t.adminAnalytics.csvTotalReviews},${data.totalReviews}`);
    lines.push(`${t.adminAnalytics.csvAvgRating},${data.avgRating.toFixed(1)}`);
    lines.push("");
    if (data.eventPerformance && data.eventPerformance.length > 0) {
      lines.push(t.adminAnalytics.csvEventPerf);
      lines.push(`${t.adminAnalytics.csvEvent},${t.adminAnalytics.csvEventRegistrations},${t.adminAnalytics.csvMaxParticipants},${t.adminAnalytics.csvFillRate},${t.adminAnalytics.csvAvgRatingLabel},${t.adminAnalytics.csvReviews}`);
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
  if (!data) return <EmptyState t={t} />;

  const hasData =
    data.totalEvents > 0 ||
    data.totalRegistrations > 0 ||
    data.totalUsers > 0;

  if (!hasData) return <EmptyState t={t} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminAnalytics.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.adminAnalytics.subtitle}
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          {t.adminAnalytics.exportReport}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {t.adminAnalytics.statRegistrations}
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {data.totalRegistrations.toLocaleString(dateLocale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t.adminAnalytics.statUsers}</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {data.totalUsers.toLocaleString(dateLocale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{t.adminAnalytics.statAvgRating}</span>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{data.avgRating.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {t.adminAnalytics.statEventsHosted}
              </span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{data.totalEvents.toLocaleString(dateLocale)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.adminAnalytics.chartRegTrend}</CardTitle>
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
                {t.adminAnalytics.noTrendData}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.adminAnalytics.chartEventPerf}</CardTitle>
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
                {t.adminAnalytics.noPerfData}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Performance Table */}
      {data.eventPerformance && data.eventPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.adminAnalytics.chartEventPerf}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable columns={performanceColumns} data={data.eventPerformance ?? []} enablePagination enableSorting pageSize={10} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
