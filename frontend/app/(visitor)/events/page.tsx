"use client";

import { useEffect, useState } from "react";
import { eventService } from "@/services/event.service";
import EventCard from "@/components/features/events/EventCard";
import type { Event } from "@/types";
import { Loader2 } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAll();
        if (response.code === 200 && response.data) {
          setEvents(response.data.events);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground mt-2">
          Browse and register for upcoming events
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No events available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
