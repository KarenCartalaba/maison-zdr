"use client";

import { useEffect, useState, useRef } from "react";
import { eventService } from "@/services/event.service";
import { galleryService } from "@/services/gallery.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Trash2,
  ImageIcon,
  Calendar,
  Grid3X3,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import { isValidImageFile } from "@/lib/utils";
import type { Event } from "@/types";

interface EventWithGallery extends Event {
  gallery: string[];
}

export default function AdminGalleryContent() {
  const [events, setEvents] = useState<EventWithGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventWithGallery | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm, dialog } = useConfirm();
  const { t, dateLocale } = useLanguage();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventService.getAll();
      if (response.code === 200 && response.data) {
        const eventsWithGallery = response.data.events.filter(
          (e) => e.gallery && e.gallery.length > 0
        );
        setEvents(eventsWithGallery);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast.error(t.adminGallery.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEvent) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.adminGallery.errorSize);
      return;
    }

    if (!isValidImageFile(file)) {
      toast.error("Invalid image format. Accepted formats: JPEG, PNG, WebP, GIF");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageBase64 = reader.result as string;
          const response = await galleryService.upload({ imageBase64, folder: `events/${selectedEvent.id}` });
          if (response.code === 200 && response.data) {
            const uploadedUrl = response.data.url;
            const updatedGallery = [...selectedEvent.gallery, uploadedUrl];
            await eventService.update({
              id: selectedEvent.id,
              gallery: updatedGallery,
            });
            const updatedEvent = { ...selectedEvent, gallery: updatedGallery };
            setSelectedEvent(updatedEvent);
            setEvents(events.map((ev) => (ev.id === selectedEvent.id ? updatedEvent : ev)));
            toast.success(t.adminGallery.uploadSuccess);
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || t.adminGallery.uploadError);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error(t.adminGallery.errorRead);
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!selectedEvent) return;

    setDeletingIndex(index);
    try {
      const imageUrl = selectedEvent.gallery[index];
      const updatedGallery = selectedEvent.gallery.filter((_, i) => i !== index);

      await galleryService.delete({ url: imageUrl });
      await eventService.update({
        id: selectedEvent.id,
        gallery: updatedGallery,
      });

      const updatedEvent = { ...selectedEvent, gallery: updatedGallery };
      setSelectedEvent(updatedEvent);
      setEvents(events.map((ev) => (ev.id === selectedEvent.id ? updatedEvent : ev)));
      toast.success(t.adminGallery.deleteSuccess);
    } catch {
      toast.error(t.adminGallery.deleteError);
    } finally {
      setDeletingIndex(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Selected event detail view
  if (selectedEvent) {
    const photoCount = selectedEvent.gallery.length === 1 ? t.adminGallery.photoCount : t.adminGallery.photoCountPlural;
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedEvent(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{selectedEvent.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedEvent.gallery.length} {photoCount} ·{" "}
              {formatDate(selectedEvent.eventDate, dateLocale, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Button
            className="bg-[#1a5c2a] hover:bg-[#144a22]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {t.adminGallery.uploadPhoto}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {selectedEvent.gallery.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t.adminGallery.noPhotosTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.adminGallery.noPhotosDesc}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedEvent.gallery.map((url, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={url}
                  alt={`Gallery image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <button
                    onClick={() =>
                      confirm({
                        title: t.adminGallery.deleteTitle,
                        description: t.adminGallery.deleteDesc,
                        confirmLabel: t.adminGallery.deleteConfirm,
                        onConfirm: () => handleDeleteImage(index),
                      })
                    }
                  disabled={deletingIndex === index}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  {deletingIndex === index ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Events grid view
  return (
    <div>
      {dialog}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.adminGallery.title}</h1>
        <p className="text-muted-foreground mt-2">
          {t.adminGallery.subtitle}
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.adminGallery.noEventsTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t.adminGallery.noEventsDesc}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="text-left group"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {event.gallery[0] ? (
                    <img
                      src={event.gallery[0]}
                      alt={event.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-black/60 text-white border-0">
                      <Grid3X3 className="h-3 w-3 mr-1" />
                      {event.gallery.length}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{event.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(event.eventDate, dateLocale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
