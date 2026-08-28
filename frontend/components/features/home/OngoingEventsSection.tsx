import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Acoustic Fridays",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    capacity: { used: 8, total: 20 },
    status: "ongoing" as const,
    // TODO: Replace with actual event image
    image: "/images/event-1.jpg",
  },
  {
    id: "2",
    title: "Cocktail Night",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    capacity: { used: 8, total: 20 },
    status: "ongoing" as const,
    // TODO: Replace with actual event image
    image: "/images/event-2.jpg",
  },
  {
    id: "3",
    title: "Trivia Hour",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    capacity: { used: 8, total: 20 },
    status: "ongoing" as const,
    // TODO: Replace with actual event image
    image: "/images/event-3.jpg",
  },
];

export default function OngoingEventsSection() {
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
        {MOCK_EVENTS.map((event) => (
          <Card key={event.id} className="overflow-hidden border-none shadow-md">
            {/* TODO: Replace placeholder with actual event image */}
            <div className="relative h-48 bg-muted">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 right-3 bg-[#1a5c2a] hover:bg-[#144a22]">
                {event.status === "ongoing" ? "Ongoing" : "Upcoming"}
              </Badge>
            </div>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Registration availability</span>
                  <span className="text-muted-foreground">{event.capacity.used}/{event.capacity.total} slot left</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[#1a5c2a]"
                    style={{ width: `${(event.capacity.used / event.capacity.total) * 100}%` }}
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
        ))}
      </div>
    </section>
  );
}
