"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { eventService } from "@/services/event.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

interface AdminEventsContentProps {
  initialEvents?: any[];
}

export default function AdminEventsContent({ initialEvents = [] }: AdminEventsContentProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(initialEvents.length === 0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming" | "past" | "cancelled">("all");

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

  const eventTypeLabels: Record<string, string> = {
    FORMAL: "Formal",
    CASUAL: "Casual",
    SOCIAL: "Social",
    WORKSHOP: "Workshop",
    LIVE_MUSIC: "Live Music",
    FOOD_AND_DRINK: "Food & Drink",
    TRIVIA: "Trivia",
    PRIVATE: "Private",
  };

  useEffect(() => {
    if (initialEvents.length > 0) return; // Already have SSR data

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
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await eventService.delete(id);
      if (response.code === 200) {
        setEvents(events.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const tabs = [
    { id: "all" as const, label: "ALL EVENTS" },
    { id: "ongoing" as const, label: "ONGOING" },
    { id: "upcoming" as const, label: "UPCOMING" },
    { id: "past" as const, label: "PAST" },
    { id: "cancelled" as const, label: "CANCELLED" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events Overview</h1>
          <p className="text-sm text-muted-foreground">Full event calendar and attendance</p>
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
              CREATE NEW EVENT
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
              No events found. Create your first event!
            </div>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="h-40 bg-muted">
                  <img
                    src="/images/event-placeholder.jpg"
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-[#e8f5e9] text-[#1a5c2a]">
                      Public · {eventTypeLabels[event.eventType] || "Social"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {event.location || "Bar & Lounge"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{event._count?.registrations || 0} / {event.maxParticipants} registrations</span>
                    <span className={event.isCancelled ? "text-red-500" : "text-[#1a5c2a]"}>
                      {event.isCancelled ? "Cancelled" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/events/${event.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Details</Button>
                    </Link>
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Cover</th>
                    <th className="px-6 py-3 font-medium">TITLE</th>
                    <th className="px-6 py-3 font-medium">DATE</th>
                    <th className="px-6 py-3 font-medium">TIME</th>
                    <th className="px-6 py-3 font-medium">VENUE</th>
                    <th className="px-6 py-3 font-medium">TYPE</th>
                    <th className="px-6 py-3 font-medium">PRICE</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                    <th className="px-6 py-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                        No events found. Create your first event!
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((event) => (
                      <tr key={event.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-6 py-3">
                          <div className="h-10 w-14 rounded overflow-hidden bg-muted">
                            <img src="/images/event-placeholder.jpg" alt={event.title} className="h-full w-full object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium">{event.title}</td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {new Date(event.eventDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{event.location}</td>
                        <td className="px-6 py-3">
                          <Badge variant="secondary" className="bg-[#e8f5e9] text-[#1a5c2a]">Public · {eventTypeLabels[event.eventType] || "Social"}</Badge>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={event.isCancelled ? "destructive" : "outline"} className={!event.isCancelled ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
                            {event.isCancelled ? "Cancelled" : "Active"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/events/${event.id}`}>
                              <Button variant="ghost" size="sm">···</Button>
                            </Link>
                            <Link href={`/admin/events/${event.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
