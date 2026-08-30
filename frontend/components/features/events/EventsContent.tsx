"use client";

import { useEffect, useState } from "react";
import EventHeroBanner from "@/components/features/events/EventHeroBanner";
import EventFilters from "@/components/features/events/EventFilters";
import EventCard from "@/components/features/events/EventCard";
import { eventService } from "@/services/event.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "lucide-react";
import type { Event } from "@/types";

const ITEMS_PER_PAGE = 6;

interface EventsContentProps {
  initialEvents?: Event[];
}

export default function EventsContent({ initialEvents = [] }: EventsContentProps) {
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (initialEvents.length > 0) return; // Already have SSR data
    eventService.getAll()
      .then((res) => {
        if (res.data) setEvents(res.data.events);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialEvents.length]);

  const filteredEvents = events
    .filter((e) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term)
      );
    })
    .filter((e) => {
      if (selectedCategory === "All Events") return true;
      const typeMap: Record<string, string[]> = {
        "Food": ["FOOD_AND_DRINK"],
        "Arts": ["WORKSHOP", "SOCIAL"],
        "Games": ["TRIVIA"],
        "Music": ["LIVE_MUSIC"],
        "Performance": ["FORMAL", "CASUAL"],
      };
      const types = typeMap[selectedCategory] || [];
      return types.includes(e.eventType);
    });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <>
      <EventHeroBanner />
      <div className="container px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Events</h1>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search events by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <EventFilters selected={selectedCategory} onSelect={setSelectedCategory} />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {paginatedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
        {filteredEvents.length > 0 && (
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
        {!loading && filteredEvents.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No events found in this category.</p>
        )}
      </div>
    </>
  );
}
