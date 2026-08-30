"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const { isAuthenticated, isVerified } = useAuth();
  const registrationCount = event._count?.registrations || 0;
  const capacityPercentage = (registrationCount / event.maxParticipants) * 100;
  const isDeadlinePassed = new Date(event.deadline) < new Date();

  const getStatusBadge = (): { label: string; className: string } => {
    if (event.isCancelled) return { label: "Cancelled", className: "bg-red-600 hover:bg-red-700" };

    const now = new Date();
    const eventDate = new Date(event.eventDate);

    // Compare date portions only (ignore time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    if (eventDay < today) return { label: "Completed", className: "bg-gray-600 hover:bg-gray-700" };
    if (eventDay.getTime() === today.getTime()) return { label: "Ongoing", className: "bg-[#1a5c2a] hover:bg-[#144a22]" };
    return { label: "Upcoming", className: "bg-[#1a5c2a] hover:bg-[#144a22]" };
  };

  const statusBadge = getStatusBadge();

  const getButtonState = () => {
    if (event.isCancelled) return { text: "Event Cancelled", disabled: true };
    if (isDeadlinePassed) return { text: "Registration Closed", disabled: true };
    if (!isAuthenticated) return { text: "View Details", disabled: false };
    if (!isVerified) return { text: "View Details", disabled: false };
    return { text: "View Details", disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="relative h-48 bg-muted">
        {event.gallery?.[0] ? (
          <img
            src={event.gallery[0]}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] flex items-center justify-center">
            <span className="text-4xl font-bold text-white/80">{event.title.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <Badge className={`absolute top-3 right-3 ${statusBadge.className}`}>
          {statusBadge.label}
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
            <span className="text-muted-foreground">
              {registrationCount}/{event.maxParticipants} slot left
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#1a5c2a]"
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
        </div>
        <Link href={`/events/${event.id}`}>
          <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">
            {buttonState.text}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
