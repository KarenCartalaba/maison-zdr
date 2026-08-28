"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ArrowLeft, Loader2, Pencil, Trash2, Calendar, MapPin, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import type { Event } from "@/types";
import { toast } from "sonner";

type Tab = "overview" | "participants" | "reviews" | "highlights" | "settings";

export default function EventWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getById(eventId);
        if (response.code === 200 && response.data) {
          setEvent(response.data.event);
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
        <Link href="/admin/events">
          <Button variant="link" className="mt-4">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "participants", label: "Participants" },
    { id: "reviews", label: "Reviews" },
    { id: "highlights", label: "Highlights" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/events" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            {event.isCancelled && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Event workspace · Created {new Date(event.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/events/${eventId}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-[#1a5c2a] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && <OverviewTab event={event} />}
        {activeTab === "participants" && <ParticipantsTab eventId={eventId} />}
        {activeTab === "reviews" && <ReviewsTab eventId={eventId} />}
        {activeTab === "highlights" && <HighlightsTab event={event} />}
        {activeTab === "settings" && <SettingsTab event={event} />}
      </div>
    </div>
  );
}

// ==================== Overview Tab ====================

function OverviewTab({ event }: { event: Event }) {
  const confirmedCount = event._count?.registrations || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Event Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{event.description || "No description provided"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p className="text-xs text-muted-foreground">{new Date(event.eventDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{event.location}</p>
                <p className="text-xs text-muted-foreground">Venue</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Registrations</span>
              </div>
              <span className="text-lg font-bold">{confirmedCount} / {event.maxParticipants}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted mt-2">
              <div
                className="h-full rounded-full bg-[#1a5c2a]"
                style={{ width: `${Math.min((confirmedCount / event.maxParticipants) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Status</span>
              </div>
              <Badge variant={event.isCancelled ? "destructive" : "outline"} className={!event.isCancelled ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
                {event.isCancelled ? "Cancelled" : "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Deadline</span>
              </div>
              <span className="text-sm font-medium">{new Date(event.deadline).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== Participants Tab ====================

function ParticipantsTab({ eventId }: { eventId: string }) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setIsLoading(false);
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registered Participants</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">NAME</th>
                <th className="px-6 py-3 font-medium">EMAIL</th>
                <th className="px-6 py-3 font-medium">STATUS</th>
                <th className="px-6 py-3 font-medium">REGISTERED</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No participants yet
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium">{p.user?.name || "Unknown"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.user?.email}</td>
                    <td className="px-6 py-3">
                      <Badge variant={p.status === "CONFIRMED" ? "outline" : "secondary"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== Reviews Tab ====================

function ReviewsTab({ eventId }: { eventId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Reviews feature coming soon</p>
          <p className="text-xs mt-1">Add a Review model to the Prisma schema to enable this feature</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== Highlights Tab ====================

function HighlightsTab({ event }: { event: Event }) {
  const gallery = event.gallery || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event Highlights</CardTitle>
      </CardHeader>
      <CardContent>
        {gallery.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No highlights uploaded yet</p>
            <p className="text-xs mt-1">Upload images to showcase this event</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((url, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={url} alt={`Highlight ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== Settings Tab ====================

const eventSettingsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  maxParticipants: z.number().min(1, "Must be at least 1"),
  isCancelled: z.boolean(),
});

type EventSettingsValues = z.infer<typeof eventSettingsSchema>;

function SettingsTab({ event }: { event: Event }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<EventSettingsValues>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      location: event.location,
      maxParticipants: event.maxParticipants,
      isCancelled: event.isCancelled,
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: EventSettingsValues) => {
    setIsUpdating(true);
    try {
      await eventService.update({
        id: event.id,
        title: data.title,
        description: data.description,
        location: data.location,
        maxParticipants: data.maxParticipants,
        isCancelled: data.isCancelled,
      });
      toast.success("Event updated successfully");
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof EventSettingsValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || "Failed to update event");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-w-xl" noValidate>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="event-title">Title</FieldLabel>
                  <Input {...field} id="event-title" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="event-description">Description</FieldLabel>
                  <Textarea {...field} id="event-description" rows={4} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="event-location">Location</FieldLabel>
                  <Input {...field} id="event-location" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="maxParticipants"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="event-maxParticipants">Max Participants</FieldLabel>
                  <Input
                    {...field}
                    id="event-maxParticipants"
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="isCancelled"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                    />
                    <span className="text-sm">Mark as cancelled</span>
                  </label>
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex gap-2">
            <Button type="submit" disabled={isUpdating} className="bg-[#1a5c2a] hover:bg-[#144a22]">
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
            <Button type="button" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
