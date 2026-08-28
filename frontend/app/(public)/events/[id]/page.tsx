"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { eventService } from "@/services/event.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Event } from "@/types";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getById(params.id as string);
        if (response.code === 200 && response.data) {
          setEvent(response.data.event);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch event");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-destructive">{error || "Event not found"}</p>
          <Link href="/events" className="mt-4 inline-block">
            <Button variant="outline">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const registrationCount = event._count?.registrations || 0;
  const capacityPercentage = (registrationCount / event.maxParticipants) * 100;
  const isDeadlinePassed = new Date(event.deadline) < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/events" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Link>

      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground mt-2">
            Organized by {event.author.name}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Registration Deadline</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.deadline).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-sm text-muted-foreground">
                  {registrationCount} / {event.maxParticipants} registered
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {event.description}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href={`/events/${event.id}/register`}>
            <Button size="lg" disabled={isDeadlinePassed || event.isCancelled}>
              {isDeadlinePassed
                ? "Registration Closed"
                : event.isCancelled
                ? "Event Cancelled"
                : "Register Now"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
