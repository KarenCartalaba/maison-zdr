"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";

interface EventWithGallery extends Event {
  gallery: string[];
}

export default function GalleryContent() {
  const [events, setEvents] = useState<EventWithGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxEvent, setLightboxEvent] = useState<EventWithGallery | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAll();
        if (response.code === 200 && response.data) {
          const eventsWithGallery = response.data.events.filter(
            (e): e is EventWithGallery =>
              e.gallery !== undefined && e.gallery.length > 0
          );
          // Sort by event date descending (newest first)
          eventsWithGallery.sort(
            (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
          );
          setEvents(eventsWithGallery);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const openLightbox = (event: EventWithGallery, index: number) => {
    setLightboxEvent(event);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxEvent(null);
    setLightboxIndex(0);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!lightboxEvent) return;
    const total = lightboxEvent.gallery.length;
    if (direction === "next") {
      setLightboxIndex((lightboxIndex + 1) % total);
    } else {
      setLightboxIndex((lightboxIndex - 1 + total) % total);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxEvent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "ArrowLeft") navigateLightbox("prev");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxEvent, lightboxIndex]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-5 w-64 mb-8" />
        <div className="space-y-12">
          {[1, 2].map((group) => (
            <div key={group}>
              <Skeleton className="h-7 w-40 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <p className="text-muted-foreground mt-2">Photos from our events</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No photos available yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back after our next event
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {events.map((event) => (
            <div key={event.id}>
              <div className="mb-4">
                <h2 className="text-xl font-bold">{event.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {event.gallery.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => openLightbox(event, index)}
                    className="aspect-square rounded-lg overflow-hidden bg-muted group focus:outline-none focus:ring-2 focus:ring-[#1a5c2a] focus:ring-offset-2"
                  >
                    <img
                      src={url}
                      alt={`${event.title} - Photo ${index + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Event title */}
          <div className="absolute top-4 left-4 text-white z-10">
            <p className="font-semibold">{lightboxEvent.title}</p>
            <p className="text-sm text-white/70">
              {lightboxIndex + 1} / {lightboxEvent.gallery.length}
            </p>
          </div>

          {/* Navigation */}
          {lightboxEvent.gallery.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
                className="absolute left-4 text-white/80 hover:text-white z-10 p-2"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
                className="absolute right-4 text-white/80 hover:text-white z-10 p-2"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={lightboxEvent.gallery[lightboxIndex]}
            alt={`${lightboxEvent.title} - Photo ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
