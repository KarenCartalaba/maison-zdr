import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import EventImage from "@/components/ui/event-image";
import type { Event } from "@/types";

interface OngoingEventsSectionProps {
  events?: Event[];
}

export default function OngoingEventsSection({ events = [] }: OngoingEventsSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="container px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Ongoing Events</h2>
          <p className="text-muted-foreground mt-1">
            Happening right now — register while slots are available
          </p>
        </div>
        <Link href="/events" className="text-sm font-medium text-[#1a5c2a] hover:underline">
          View Page &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.slice(0, 3).map((event) => {
          const regCount = event._count?.registrations || 0;
          return (
            <Card key={event.id} className="overflow-hidden border-none shadow-md">
              <div className="relative h-48">
                <EventImage src={event.gallery?.[0]} title={event.title} className="h-48" />
                <Badge className="absolute top-3 right-3 bg-[#1a5c2a] hover:bg-[#144a22]">
                  Ongoing
                </Badge>
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registration availability</span>
                    <span className="text-muted-foreground">{regCount}/{event.maxParticipants} slot left</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#1a5c2a]"
                      style={{ width: `${(regCount / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>
                <Link href={`/events/${event.id}`}>
                  <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
