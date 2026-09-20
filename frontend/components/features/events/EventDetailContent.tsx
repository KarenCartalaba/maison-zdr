"use client";

import { useEffect, useState } from "react";
import { eventService } from "@/services/event.service";
import EventDetailHero from "@/components/features/events/EventDetailHero";
import RegistrationSidebar from "@/components/features/events/RegistrationSidebar";
import GalleryGrid from "@/components/features/events/GalleryGrid";
import ReviewSection from "@/components/features/events/ReviewSection";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";

interface EventDetailContentProps {
  eventId: string;
  initialEvent?: any;
}

export default function EventDetailContent({ eventId, initialEvent }: EventDetailContentProps) {
  const [event, setEvent] = useState<any>(initialEvent || null);
  const [loading, setLoading] = useState(!initialEvent);
  const [error, setError] = useState(false);
  const { t, dateLocale } = useLanguage();

  // Always reflect the latest server data (e.g. null after a delete → "Event not found")
  useEffect(() => {
    setEvent(initialEvent || null);
    setLoading(false);
  }, [initialEvent]);

  useEffect(() => {
    if (initialEvent) return; // Already have SSR data
    eventService.getById(eventId)
      .then((res) => {
        if (res.data) setEvent(res.data.event);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [eventId, initialEvent]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-[300px] md:h-[400px] w-full" />
        <div className="container px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-32 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-2">{t.events.eventNotFound}</h1>
        <p className="text-muted-foreground">{t.events.eventNotFoundDesc}</p>
      </div>
    );
  }

  const isDeadlinePassed = new Date(event.deadline) < new Date();
  const registrationCount = event._count?.registrations || 0;

  return (
    <>
      <EventDetailHero
        title={event.title}
        imageUrl={event.gallery?.[0] || "/images/event-placeholder.jpg"}
      />

      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date, Time, Venue pills + Category badge */}
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-[#1a5c2a] hover:bg-[#144a22]">
                {event.eventType?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </Badge>
              <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <span className="text-muted-foreground">{t.events.date}</span>
                <span className="font-medium">
                  {formatDate(event.eventDate, dateLocale, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <span className="text-muted-foreground">{t.events.time}</span>
                <span className="font-medium">
                  {new Date(event.eventDate).toLocaleTimeString(dateLocale, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: dateLocale === "en-US",
                  })}{" "}–{" "}
                  {new Date(new Date(event.eventDate).getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString(dateLocale, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: dateLocale === "en-US",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <span className="text-muted-foreground">{t.events.venue}</span>
                <span className="font-medium">{event.location}</span>
              </div>
            </div>

            {/* About */}
            <div>
              <h2 className="text-2xl font-bold mb-4">{t.events.aboutThisEvent}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Organizer */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-medium">
                    {event.author?.name?.charAt(0) || "O"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.events.organizer}</p>
                  <p className="font-medium">{event.author?.name || "Maison ZDR"}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{t.events.officialOrganizer}</span>
            </div>

            {/* Gallery — pass event gallery images */}
            {event.gallery && event.gallery.length > 0 && (
              <GalleryGrid images={event.gallery} />
            )}

            {/* Reviews */}
            <ReviewSection
              eventId={event.id}
              eventDate={event.eventDate}
              allowReviewsNow={event.allowReviewsNow ?? false}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RegistrationSidebar
                eventId={event.id}
                maxParticipants={event.maxParticipants}
                registeredCount={registrationCount}
                status={event.isCancelled ? "Cancelled" : isDeadlinePassed ? "Closed" : "Open"}
                isDeadlinePassed={isDeadlinePassed}
                isCancelled={event.isCancelled}
                deadline={event.deadline}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
