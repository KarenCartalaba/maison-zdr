"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { eventService } from "@/services/event.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Event } from "@/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground mt-2">Create and manage events</p>
        </div>
        <Link href="/admin/events/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {events.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No events yet. Create your first event!
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{event.title}</h3>
                      {event.isCancelled && (
                        <Badge variant="destructive">Cancelled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString()} |{" "}
                      {event._count?.registrations || 0} registrations
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
