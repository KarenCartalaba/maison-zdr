"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import EventImage from "@/components/ui/event-image";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import type { Event } from "@/types";

interface UpcomingEventsSectionProps {
  events?: Event[];
}

export default function UpcomingEventsSection({ events = [] }: UpcomingEventsSectionProps) {
  const { t, dateLocale } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
  }, [events.length, updateScrollState]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="container px-4 py-12" aria-label={t.home.upcoming.title}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">{t.home.upcoming.title}</h2>
          <p className="text-muted-foreground mt-1">
            {t.home.upcoming.subtitle}
          </p>
        </div>
        <Link href="/events" className="text-sm font-medium text-[#1a5c2a] hover:underline">
          {t.home.upcoming.viewPage} &rarr;
        </Link>
      </div>

      {events.length === 0 ? (
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
            aria-label={t.home.upcoming.title}
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
            {events.slice(0, 8).map((event) => {
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
                      {t.home.upcoming.badge}
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
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.home.upcoming.registrationAvailability}</span>
                        <span className="text-muted-foreground">{regCount}/{event.maxParticipants} {t.home.upcoming.slotLeft}</span>
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
                        {t.home.upcoming.viewDetails}
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
              aria-label={`${t.home.upcoming.title}: scroll left`}
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
              aria-label={`${t.home.upcoming.title}: scroll right`}
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
