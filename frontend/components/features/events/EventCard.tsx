import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const registrationCount = event._count?.registrations || 0;
  const capacityPercentage = (registrationCount / event.maxParticipants) * 100;
  const isDeadlinePassed = new Date(event.deadline) < new Date();

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
          {event.isCancelled && (
            <Badge variant="destructive">Cancelled</Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(event.eventDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {registrationCount} / {event.maxParticipants}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button
            className="w-full"
            variant={isDeadlinePassed || event.isCancelled ? "secondary" : "default"}
            disabled={isDeadlinePassed || event.isCancelled}
          >
            {isDeadlinePassed
              ? "Registration Closed"
              : event.isCancelled
              ? "Cancelled"
              : "View Details"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
