"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
import {
  ArrowLeft, Loader2, Pencil, Trash2, Calendar, MapPin, Users, Clock,
  Search, Star, MessageSquare, Inbox, Upload, CheckCircle2, ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import { adminService } from "@/services/admin.service";
import { galleryService } from "@/services/gallery.service";
import type { Event, AdminRegistration, AdminReview } from "@/types";
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
  const [participants, setParticipants] = useState<AdminRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getEventParticipants(eventId);
      if (response.code === 200 && response.data) {
        setParticipants(response.data.participants);
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const handleCancel = async (registrationId: string) => {
    if (!confirm("Are you sure you want to cancel this registration?")) return;
    try {
      setActionLoading(registrationId);
      await adminService.updateRegistrationStatus(registrationId, "CANCELLED");
      toast.success("Registration cancelled");
      fetchParticipants();
    } catch (err) {
      console.error("Failed to cancel registration:", err);
      toast.error("Failed to cancel registration");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = participants.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = p.user?.name?.toLowerCase() || "";
    const email = p.user?.email?.toLowerCase() || "";
    return name.includes(q) || email.includes(q);
  });

  const totalRegistered = participants.length;
  const confirmed = participants.filter((p) => p.status === "CONFIRMED").length;
  const pending = participants.filter((p) => p.status === "PENDING").length;
  const cancelled = participants.filter((p) => p.status === "CANCELLED").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalRegistered}</p>
            <p className="text-xs text-muted-foreground">Total Registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a5c2a]">{confirmed}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{cancelled}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 bg-transparent outline-none w-full"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Participants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">GUEST</th>
                  <th className="px-6 py-3 font-medium">STATUS</th>
                  <th className="px-6 py-3 font-medium">REFERENCE</th>
                  <th className="px-6 py-3 font-medium">CHECK-IN</th>
                  <th className="px-6 py-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      {search ? "No participants match your search" : "No participants yet"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium">{p.user?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={
                            p.status === "CONFIRMED"
                              ? "outline"
                              : p.status === "CANCELLED"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            p.status === "CONFIRMED"
                              ? "text-[#1a5c2a] border-[#1a5c2a]"
                              : ""
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">
                        {(p as any).referenceNumber || "—"}
                      </td>
                      <td className="px-6 py-3">
                        {p.checkedIn ? (
                          <CheckCircle2 className="h-4 w-4 text-[#1a5c2a]" />
                        ) : (
                          <span className="text-xs text-muted-foreground">Not checked in</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {p.status !== "CANCELLED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleCancel(p.id)}
                            disabled={actionLoading === p.id}
                          >
                            {actionLoading === p.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Cancel"
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Reviews Tab ====================

function ReviewsTab({ eventId }: { eventId: string }) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getEventReviews(eventId);
      if (response.code === 200 && response.data) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setActionLoading(id);
      await adminService.updateReviewStatus(id, status);
      toast.success(`Review ${status.toLowerCase()}`);
      fetchReviews();
    } catch (err) {
      console.error("Failed to update review status:", err);
      toast.error("Failed to update review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      setActionLoading(id);
      await adminService.replyToReview(id, replyText);
      toast.success("Reply sent");
      setReplyingId(null);
      setReplyText("");
      fetchReviews();
    } catch (err) {
      console.error("Failed to reply:", err);
      toast.error("Failed to send reply");
    } finally {
      setActionLoading(null);
    }
  };

  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-4 w-4 ${
              s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
            }`}
          />
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
              <p className="text-sm text-muted-foreground">
                Reviews for this event will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{review.user.name}</p>
                    <Badge
                      variant={
                        review.status === "APPROVED"
                          ? "outline"
                          : review.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        review.status === "APPROVED"
                          ? "text-[#1a5c2a] border-[#1a5c2a]"
                          : ""
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.title && (
                <h4 className="font-medium mb-1">{review.title}</h4>
              )}
              <p className="text-sm text-muted-foreground">{review.comment}</p>

              {review.reply && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Reply:</p>
                  <p className="text-sm">{review.reply}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {review.status === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#1a5c2a] border-[#1a5c2a]"
                      onClick={() => handleStatusChange(review.id, "APPROVED")}
                      disabled={actionLoading === review.id}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-500"
                      onClick={() => handleStatusChange(review.id, "REJECTED")}
                      disabled={actionLoading === review.id}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingId(replyingId === review.id ? null : review.id);
                    setReplyText(review.reply || "");
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {review.reply ? "Edit Reply" : "Reply"}
                </Button>
              </div>

              {replyingId === review.id && (
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    className="bg-[#1a5c2a] hover:bg-[#144a22]"
                    onClick={() => handleReply(review.id)}
                    disabled={actionLoading === review.id || !replyText.trim()}
                  >
                    {actionLoading === review.id ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingId(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ==================== Highlights Tab ====================

function HighlightsTab({ event }: { event: Event }) {
  const [gallery, setGallery] = useState<string[]>(event.gallery || []);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to gallery
      const response = await galleryService.upload({
        imageBase64: base64,
        folder: "event-highlights",
      });

      if (response.code === 201 && response.data) {
        const newUrl = response.data.url;
        const updatedGallery = [...gallery, newUrl];

        // Update event with new gallery
        await eventService.update({
          id: event.id,
          gallery: updatedGallery,
        });

        setGallery(updatedGallery);
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      setDeletingUrl(imageUrl);

      // Delete from gallery storage
      await galleryService.delete({ url: imageUrl });

      // Remove from event gallery
      const updatedGallery = gallery.filter((url) => url !== imageUrl);
      await eventService.update({
        id: event.id,
        gallery: updatedGallery,
      });

      setGallery(updatedGallery);
      toast.success("Image deleted");
    } catch (err) {
      console.error("Failed to delete image:", err);
      toast.error("Failed to delete image");
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Event Highlights
            <span className="text-muted-foreground font-normal ml-2">
              ({gallery.length} {gallery.length === 1 ? "image" : "images"})
            </span>
          </CardTitle>
          <Button
            size="sm"
            className="bg-[#1a5c2a] hover:bg-[#144a22]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </CardHeader>
      <CardContent>
        {gallery.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImagePlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">No highlights uploaded yet</p>
            <p className="text-xs mt-1">Upload images to showcase this event</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((url, i) => (
              <div key={i} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={url}
                  alt={`Highlight ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(url)}
                    disabled={deletingUrl === url}
                  >
                    {deletingUrl === url ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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
