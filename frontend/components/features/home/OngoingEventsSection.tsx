"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import EventImage from "@/components/ui/event-image";
import { eventService } from "@/services/event.service";
import { fetchWithOneRetry } from "@/lib/retry-fetch";
import { isSameCalendarDay } from "@/components/features/events/event-status";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import { DEFAULT_EVENT_LOCATION } from "@/constants/event-location";
import type { Event } from "@/types";

interface OngoingEventsSectionProps {
  events?: Event[];
}

export default function OngoingEventsSection({ events = [] }: OngoingEventsSectionProps) {
  const { t, dateLocale } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  // Client-side recovery (mirrors UpcomingEventsSection): the SSR ongoing list
  // is filtered with the SERVER clock, which can disagree with the browser
  // clock (timezone/skew near midnight), emptying this section while the
  // Events page and admin tabs — both browser-local — still show the event as
  // ongoing. When the server delivered nothing, refetch real DB records and
  // re-apply the same rule with the browser clock.
  const [fallbackEvents, setFallbackEvents] = useState<Event[] | null>(null);
  const [isFetchingFallback, setIsFetchingFallback] = useState(events.length === 0);

  const ongoingEvents = useMemo(() => {
    if (events.length > 0) return events;
    if (!fallbackEvents) return [];
    const now = new Date();
    return fallbackEvents.filter((e) => {
      if (e.isCancelled) return false;
      const eventDate = new Date(e.eventDate);
      return eventDate <= now && isSameCalendarDay(eventDate, now);
    });
  }, [events, fallbackEvents]);

  useEffect(() => {
    if (events.length > 0) return; // SSR data is enough
    let active = true;
    fetchWithOneRetry(() => eventService.getAll())
      .then((res) => {
        if (active && Array.isArray(res.data?.events)) {
          setFallbackEvents(res.data.events);
        }
      })
      .catch(() => {
        // Settled failure: show the normal empty state below.
      })
      .finally(() => {
        if (active) setIsFetchingFallback(false);
      });
    return () => {
      active = false;
    };
  }, [events.length]);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 1);
    setCanScrollNext(el.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [ongoingEvents.length, updateScrollState]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="container px-4 py-12" aria-label={t.home.ongoing.title}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">{t.home.ongoing.title}</h2>
          <p className="text-muted-foreground mt-1">
            {t.home.ongoing.subtitle}
          </p>
        </div>
        <Link href="/events" className="text-sm font-medium text-[#1a5c2a] hover:underline">
          {t.home.ongoing.viewPage} &rarr;
        </Link>
      </div>

      {isFetchingFallback && ongoingEvents.length === 0 ? (
        // The server delivered nothing — hold the layout with card skeletons
        // while the client refetch runs, instead of flashing the "no events"
        // empty state before real DB records arrive.
        <div className="flex gap-6 overflow-hidden pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[85vw] sm:w-[360px] rounded-lg border shadow-md overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : ongoingEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{t.home.emptyEvents}</p>
        </div>
      ) : (
        <div className="relative">
          <div
            ref={trackRef}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label={t.home.ongoing.title}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                scrollByCard(1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                scrollByCard(-1);
              }
            }}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a] focus-visible:ring-offset-2 rounded-lg"
          >
            {ongoingEvents.slice(0, 8).map((event) => {
              const regCount = event._count?.registrations || 0;
              return (
                <Card
                  key={event.id}
                  data-carousel-card
                  className="snap-start shrink-0 w-[85vw] sm:w-[360px] overflow-hidden border-none shadow-md"
                >
                  <div className="relative h-48">
                    <EventImage src={event.gallery?.[0]} title={event.title} className="h-48" />
                    <Badge className="absolute top-3 right-3 bg-[#1a5c2a] hover:bg-[#144a22]">
                      {t.home.ongoing.badge}
                    </Badge>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(event.eventDate, dateLocale, {
                          weekday: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location || DEFAULT_EVENT_LOCATION}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.home.ongoing.registrationAvailability}</span>
                        <span className="text-muted-foreground">{regCount}/{event.maxParticipants} {t.home.ongoing.slotLeft}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#1a5c2a]"
                          style={{ width: `${Math.min(100, (regCount / event.maxParticipants) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">
                        {t.home.ongoing.viewDetails}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {canScrollPrev && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={`${t.home.ongoing.title}: scroll left`}
              onClick={() => scrollByCard(-1)}
              className="hidden md:inline-flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-white shadow-md z-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {canScrollNext && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={`${t.home.ongoing.title}: scroll right`}
              onClick={() => scrollByCard(1)}
              className="hidden md:inline-flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-white shadow-md z-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
