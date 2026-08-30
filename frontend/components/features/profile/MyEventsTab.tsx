"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Grid, List } from "lucide-react";
import { authService } from "@/services/auth.service";
import { Skeleton } from "@/components/ui/skeleton";
import EventImage from "@/components/ui/event-image";

const FILTERS = ["All", "Upcoming", "Attended", "Cancelled"];

export default function MyEventsTab() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getMyRegistrations()
      .then((res) => {
        if (res.data) setRegistrations(res.data.registrations);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const events = registrations.map((reg) => ({
    ...reg.event,
    registration: reg,
    status: reg.checkedIn ? "Attended" : reg.event.isCancelled ? "Cancelled" : new Date(reg.event.eventDate) > now ? "Upcoming" : "Registered",
  }));

  const filteredEvents = events.filter((event) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Upcoming") return event.status === "Upcoming";
    if (selectedFilter === "Attended") return event.status === "Attended";
    if (selectedFilter === "Cancelled") return event.status === "Cancelled";
    return true;
  });

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Events</h2>
          <p className="text-sm text-muted-foreground mt-1">Track your registration, attendance, and event history.</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
              <Skeleton className="h-20 w-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Events</h2>
        <p className="text-sm text-muted-foreground mt-1">Track your registration, attendance, and event history.</p>
      </div>

      {/* Filter tabs + View toggle */}
      <div className="flex items-center justify-between mb-8 border-b">
        <div className="flex gap-4">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                selectedFilter === filter
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No events found</p>
          <p className="text-sm mt-1">Register for events to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-4 rounded-lg border p-4 hover:shadow-sm transition-shadow">
              <EventImage src={event.gallery?.[0]} title={event.title} cacheKey={event.updatedAt} className="h-20 w-28 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <Badge variant="outline" className={`text-xs ${
                    event.status === "Attended" ? "text-[#1a5c2a] border-[#1a5c2a]"
                    : event.status === "Cancelled" ? "text-red-500 border-red-500"
                    : event.status === "Upcoming" ? "text-blue-500 border-blue-500"
                    : "text-muted-foreground"
                  }`}>{event.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
              </div>
              <Link href={`/events/${event.id}`}>
                <Button variant="outline" size="sm">View Details →</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
