"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { useConfirm } from "@/components/ui/confirm-dialog";
import Link from "next/link";
import { eventService } from "@/services/event.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import type { Event } from "@/types";

interface AdminEventsContentProps {
  initialEvents?: any[];
}

export default function AdminEventsContent({ initialEvents = [] }: AdminEventsContentProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(initialEvents.length === 0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { confirm, dialog } = useConfirm();
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming" | "past" | "cancelled">("all");
  const { t, dateLocale } = useLanguage();

  const now = new Date();

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.eventDate);
    const deadline = new Date(event.deadline);

    switch (activeTab) {
      case "ongoing":
        return !event.isCancelled && eventDate <= now && deadline >= now;
      case "upcoming":
        return !event.isCancelled && eventDate > now;
      case "past":
        return !event.isCancelled && eventDate < now;
      case "cancelled":
        return event.isCancelled;
      default:
        return true;
    }
  });

  const eventTypeLabels: Record<string, string> = useMemo(() => ({
    FORMAL: t.adminEvents.typeFormal,
    CASUAL: t.adminEvents.typeCasual,
    SOCIAL: t.adminEvents.typeSocial,
    WORKSHOP: t.adminEvents.typeWorkshop,
    LIVE_MUSIC: t.adminEvents.typeLiveMusic,
    FOOD_AND_DRINK: t.adminEvents.typeFoodDrink,
    TRIVIA: t.adminEvents.typeTrivia,
    PRIVATE: t.adminEvents.typePrivate,
  }), [t]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAll();
        if (response.code === 200 && response.data) {
          setEvents(response.data.events);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [initialEvents.length]);

  const handleDelete = async (id: string) => {
    try {
      const response = await eventService.delete(id);
      if (response.code === 200) {
        const newEvents = events.filter((e) => e.id !== id);
        setEvents(newEvents);
        toast.success(t.adminEvents.deleteSuccess);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, t.adminEvents.deleteError));
    }
  };

  // TanStack Table columns for list view
  const eventColumns: DataTableColumn[] = useMemo(() => [
    {
      id: "cover",
      header: t.adminEvents.colCover,
      cell: ({ row }) => (
        <div className="h-10 w-14 rounded overflow-hidden bg-muted">
          {row.original.gallery?.[0] ? (
            <img src={row.original.gallery[0]} alt={row.original.title} className="h-full w-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] flex items-center justify-center">
              <span className="text-xs font-bold text-white/80">{row.original.title.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminEvents.colTitle} />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      id: "date",
      header: t.adminEvents.colDate,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.eventDate, dateLocale, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      id: "time",
      header: t.adminEvents.colTime,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.eventDate).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      id: "venue",
      header: t.adminEvents.colVenue,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.location}</span>
      ),
    },
    {
      id: "type",
      header: t.adminEvents.colType,
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-[#e8f5e9] text-[#1a5c2a]">{t.adminEvents.publicBadge} · {eventTypeLabels[row.original.eventType] || t.adminEvents.typeSocial}</Badge>
      ),
    },
    {
      id: "status",
      header: t.adminEvents.colStatus,
      cell: ({ row }) => (
        <Badge variant={row.original.isCancelled ? "destructive" : "outline"} className={!row.original.isCancelled ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
          {row.original.isCancelled ? t.adminEvents.cancelled : t.adminEvents.active}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: t.adminEvents.colActions,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/events/${row.original.id}`}>
            <Button variant="ghost" size="sm">···</Button>
          </Link>
          <Link href={`/admin/events/${row.original.id}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              confirm({
                title: t.adminEvents.deleteTitle,
                description: t.adminEvents.deleteDesc.replace("{title}", row.original.title),
                confirmLabel: t.adminEvents.deleteConfirm,
                onConfirm: () => handleDelete(row.original.id),
              })
            }
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      ),
    },
  ], [t, dateLocale, eventTypeLabels, confirm]);

  const tabs = useMemo(() => [
    { id: "all" as const, label: t.adminEvents.tabAll },
    { id: "ongoing" as const, label: t.adminEvents.tabOngoing },
    { id: "upcoming" as const, label: t.adminEvents.tabUpcoming },
    { id: "past" as const, label: t.adminEvents.tabPast },
    { id: "cancelled" as const, label: t.adminEvents.tabCancelled },
  ], [t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {dialog}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminEvents.title}</h1>
          <p className="text-sm text-muted-foreground">{t.adminEvents.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid" ? "bg-[#1a5c2a] text-white" : "bg-white text-muted-foreground hover:bg-muted"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list" ? "bg-[#1a5c2a] text-white" : "bg-white text-muted-foreground hover:bg-muted"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Link href="/admin/events/create">
            <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
              <Plus className="h-4 w-4 mr-2" />
              {t.adminEvents.createNew}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-3 text-xs font-semibold tracking-wider transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-[#1a5c2a] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {t.adminEvents.noEvents}
            </div>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="h-40 bg-muted">
                  {event.gallery?.[0] ? (
                    <img
                      src={event.gallery[0]}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] flex items-center justify-center">
                      <span className="text-2xl font-bold text-white/80">{event.title.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-[#e8f5e9] text-[#1a5c2a]">
                      {t.adminEvents.publicBadge} · {eventTypeLabels[event.eventType] || t.adminEvents.typeSocial}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatDate(event.eventDate, dateLocale, { month: "short", day: "numeric" })} · {event.location || "Bar & Lounge"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{event._count?.registrations || 0} / {event.maxParticipants} {t.adminEvents.registrations}</span>
                    <span className={event.isCancelled ? "text-red-500" : "text-[#1a5c2a]"}>
                      {event.isCancelled ? t.adminEvents.cancelled : t.adminEvents.active}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/events/${event.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">{t.adminEvents.details}</Button>
                    </Link>
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        confirm({
                          title: t.adminEvents.deleteTitle,
                          description: t.adminEvents.deleteDesc.replace("{title}", event.title),
                          confirmLabel: t.adminEvents.deleteConfirm,
                          onConfirm: () => handleDelete(event.id),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            {filteredEvents.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                {t.adminEvents.noEvents}
              </div>
            ) : (
            <DataTable
              columns={eventColumns}
              data={filteredEvents}
              enablePagination
              enableSorting
              pageSize={10}
              getHeaderClassName={(id) => id === "actions" ? "text-right" : undefined}
            />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
