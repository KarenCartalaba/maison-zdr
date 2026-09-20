"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
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
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  ArrowLeft, Loader2, Pencil, Trash2, Calendar, MapPin, Users, Clock,
  Search, Star, MessageSquare, Inbox, Upload, CheckCircle2, ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { eventService } from "@/services/event.service";
import { adminService } from "@/services/admin.service";
import { galleryService } from "@/services/gallery.service";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import type { Event, AdminRegistration, AdminReview } from "@/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";

type Tab = "overview" | "participants" | "reviews" | "highlights" | "settings";

export default function EventWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { t, dateLocale } = useLanguage();

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
        <p className="text-muted-foreground">{t.adminWorkspace.notFound}</p>
        <Link href="/admin/events">
          <Button variant="link" className="mt-4">{t.adminWorkspace.backToEvents}</Button>
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: t.adminWorkspace.tabOverview },
    { id: "participants", label: t.adminWorkspace.tabParticipants },
    { id: "reviews", label: t.adminWorkspace.tabReviews },
    { id: "highlights", label: t.adminWorkspace.tabHighlights },
    { id: "settings", label: t.adminWorkspace.tabSettings },
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
              <Badge variant="destructive">{t.adminWorkspace.overviewCancelled}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t.adminWorkspace.overviewCreated} {formatDate(event.createdAt, dateLocale)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/events/${eventId}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              {t.adminWorkspace.edit}
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
        {activeTab === "overview" && <OverviewTab event={event} t={t} dateLocale={dateLocale} />}
        {activeTab === "participants" && <ParticipantsTab eventId={eventId} t={t} dateLocale={dateLocale} />}
        {activeTab === "reviews" && <ReviewsTab eventId={eventId} t={t} dateLocale={dateLocale} />}
        {activeTab === "highlights" && <HighlightsTab event={event} t={t} dateLocale={dateLocale} />}
        {activeTab === "settings" && <SettingsTab event={event} t={t} dateLocale={dateLocale} onUpdated={(updated) => { setEvent(updated); setActiveTab("overview"); }} />}
      </div>
    </div>
  );
}

// ==================== Overview Tab ====================

function OverviewTab({ event, t, dateLocale }: { event: Event; t: any; dateLocale: string }) {
  const confirmedCount = event._count?.registrations || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">{t.adminWorkspace.overviewTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t.adminWorkspace.overviewDescription}</p>
            <p className="text-sm">{event.description || t.adminWorkspace.overviewNoDesc}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{new Date(event.eventDate).toLocaleDateString(dateLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p className="text-xs text-muted-foreground">{new Date(event.eventDate).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{event.location}</p>
                <p className="text-xs text-muted-foreground">{t.adminWorkspace.overviewVenue}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.adminWorkspace.overviewRegistrations}</span>
              </div>
              <span className="text-lg font-bold">{confirmedCount.toLocaleString(dateLocale)} / {event.maxParticipants.toLocaleString(dateLocale)}</span>
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
                <span className="text-sm">{t.adminWorkspace.overviewStatus}</span>
              </div>
              <Badge variant={event.isCancelled ? "destructive" : "outline"} className={!event.isCancelled ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
                {event.isCancelled ? t.adminWorkspace.overviewCancelled : "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.adminWorkspace.overviewDeadline}</span>
              </div>
              <span className="text-sm font-medium">{formatDate(event.deadline, dateLocale)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== Participants Tab ====================

function ParticipantsTab({ eventId, t, dateLocale }: { eventId: string; t: any; dateLocale: string }) {
  const [participants, setParticipants] = useState<AdminRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

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
    try {
      setActionLoading(registrationId);
      await adminService.updateRegistrationStatus(registrationId, "CANCELLED");
      toast.success(t.adminWorkspace.regCancelled);
      fetchParticipants();
    } catch (err) {
      toast.error(t.adminWorkspace.regCancelError);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (registrationId: string) => {
    try {
      setActionLoading(registrationId);
      await adminService.updateRegistrationStatus(registrationId, "CONFIRMED");
      toast.success(t.adminWorkspace.regRestored);
      fetchParticipants();
    } catch (err) {
      toast.error(getErrorMessage(err, t.adminWorkspace.regRestoreError));
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

  const participantColumns: DataTableColumn[] = useMemo(() => [
    {
      id: "guest",
      accessorFn: (row) => row.user?.name || "",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminWorkspace.participantsGuest} />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.user?.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{row.original.user?.email}</p>
        </div>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminWorkspace.participantsStatus} />,
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "CONFIRMED"
              ? "outline"
              : row.original.status === "CANCELLED"
              ? "destructive"
              : "secondary"
          }
          className={
            row.original.status === "CONFIRMED"
              ? "text-[#1a5c2a] border-[#1a5c2a]"
              : ""
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "reference",
      header: t.adminWorkspace.participantsReference,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {row.original.referenceNumber || "\u2014"}
        </span>
      ),
    },
    {
      id: "checkin",
      header: t.adminWorkspace.participantsCheckin,
      cell: ({ row }) =>
        row.original.checkedIn ? (
          <CheckCircle2 className="h-4 w-4 text-[#1a5c2a]" />
        ) : (
          <span className="text-xs text-muted-foreground">{t.adminWorkspace.participantsNotCheckedIn}</span>
        ),
    },
    {
      id: "actions",
      header: t.adminWorkspace.participantsActions,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1">
            {p.status === "CANCELLED" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#1a5c2a] hover:text-[#144a22] hover:bg-green-50"
                disabled={actionLoading === p.id}
                onClick={() => handleRestore(p.id)}
              >
                {actionLoading === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t.adminWorkspace.participantsRestore
                )}
              </Button>
            )}
            {p.status !== "CANCELLED" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() =>
                  confirm({
                    title: t.adminWorkspace.cancelRegTitle,
                    description: t.adminWorkspace.cancelRegDesc.replace("{name}", p.user?.name || "this participant"),
                    confirmLabel: t.adminWorkspace.cancelRegConfirm,
                    onConfirm: () => handleCancel(p.id),
                  })
                }
                disabled={actionLoading === p.id}
              >
                {actionLoading === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t.adminWorkspace.participantsCancel
                )}
              </Button>
            )}
          </div>
        );
      },
    },
  ], [t, actionLoading, confirm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dialog}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalRegistered.toLocaleString(dateLocale)}</p>
            <p className="text-xs text-muted-foreground">{t.adminWorkspace.participantsStatsTotal}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a5c2a]">{confirmed.toLocaleString(dateLocale)}</p>
            <p className="text-xs text-muted-foreground">{t.adminWorkspace.participantsStatsConfirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pending.toLocaleString(dateLocale)}</p>
            <p className="text-xs text-muted-foreground">{t.adminWorkspace.participantsStatsPending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{cancelled.toLocaleString(dateLocale)}</p>
            <p className="text-xs text-muted-foreground">{t.adminWorkspace.participantsStatsCancelled}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.adminWorkspace.participantsSearch}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 bg-transparent outline-none w-full"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.adminWorkspace.participantsTableTitle}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DataTable
              columns={participantColumns}
              data={filtered}
              enablePagination
              enableSorting
              enableFiltering={false}
              pageSize={10}
              emptyContent={
                <div className="px-6 py-12 text-center text-muted-foreground">
                  <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {search ? t.adminWorkspace.participantsEmptySearch : t.adminWorkspace.participantsEmpty}
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Reviews Tab ====================

function ReviewsTab({ eventId, t, dateLocale }: { eventId: string; t: any; dateLocale: string }) {
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
              <h3 className="text-lg font-medium mb-1">{t.adminWorkspace.reviewsEmptyTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {t.adminWorkspace.reviewsEmptyDesc}
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
                    {formatDate(review.createdAt, dateLocale, {
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
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t.adminWorkspace.reviewsReplyLabel}</p>
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
                      {t.adminWorkspace.reviewsApprove}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-500"
                      onClick={() => handleStatusChange(review.id, "REJECTED")}
                      disabled={actionLoading === review.id}
                    >
                      {t.adminWorkspace.reviewsReject}
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
                  {review.reply ? t.adminWorkspace.reviewsEditReply : t.adminWorkspace.reviewsReply}
                </Button>
              </div>

              {replyingId === review.id && (
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder={t.adminWorkspace.reviewsWriteReply}
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
                    {actionLoading === review.id ? t.adminWorkspace.reviewsSending : t.adminWorkspace.reviewsSend}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingId(null);
                      setReplyText("");
                    }}
                  >
                    {t.adminWorkspace.reviewsCancel}
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

function HighlightsTab({ event, t, dateLocale }: { event: Event; t: any; dateLocale: string }) {
  const [gallery, setGallery] = useState<string[]>(event.gallery || []);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm, dialog } = useConfirm();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t.adminWorkspace.highlightsErrorFile);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.adminWorkspace.highlightsErrorSize);
      return;
    }

    try {
      setIsUploading(true);
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await galleryService.upload({
        imageBase64: base64,
        folder: "event-highlights",
      });

      if (response.code === 201 && response.data) {
        const newUrl = response.data.url;
        const updatedGallery = [...gallery, newUrl];
        await eventService.update({
          id: event.id,
          gallery: updatedGallery,
        });
        setGallery(updatedGallery);
        toast.success(t.adminWorkspace.highlightsUploadSuccess);
      }
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      toast.error(err.response?.data?.message || t.adminWorkspace.highlightsDeleteError);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (imageUrl: string) => {
    try {
      setDeletingUrl(imageUrl);
      await galleryService.delete({ url: imageUrl });
      const updatedGallery = gallery.filter((url) => url !== imageUrl);
      await eventService.update({
        id: event.id,
        gallery: updatedGallery,
      });
      setGallery(updatedGallery);
      toast.success(t.adminWorkspace.highlightsDeleteSuccess);
    } catch (err) {
      console.error("Failed to delete image:", err);
      toast.error(t.adminWorkspace.highlightsDeleteError);
    } finally {
      setDeletingUrl(null);
    }
  };

  const imageLabel = gallery.length === 1 ? t.adminWorkspace.highlightsImage : t.adminWorkspace.highlightsImages;

  return (
    <Card>
      {dialog}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t.adminWorkspace.highlightsTitle}
            <span className="text-muted-foreground font-normal ml-2">
              ({gallery.length} {imageLabel})
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
            {t.adminWorkspace.highlightsUpload}
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
            <p className="font-medium">{t.adminWorkspace.highlightsEmptyTitle}</p>
            <p className="text-xs mt-1">{t.adminWorkspace.highlightsEmptyDesc}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t.adminWorkspace.highlightsUploadImage}
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
                    onClick={() =>
                      confirm({
                        title: t.adminWorkspace.highlightsDeleteImage,
                        description: t.adminWorkspace.highlightsDeleteDesc,
                        confirmLabel: t.adminWorkspace.highlightsDeleteConfirm,
                        onConfirm: () => handleDelete(url),
                      })
                    }
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
  allowReviewsNow: z.boolean(),
});

type EventSettingsValues = z.infer<typeof eventSettingsSchema>;

function SettingsTab({ event, t, dateLocale, onUpdated }: { event: Event; t: any; dateLocale: string; onUpdated: (event: Event) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<EventSettingsValues>({
    resolver: zodResolver(eventSettingsSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      location: event.location,
      maxParticipants: event.maxParticipants,
      isCancelled: event.isCancelled,
      allowReviewsNow: event.allowReviewsNow ?? false,
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: EventSettingsValues) => {
    setIsUpdating(true);
    try {
      const response = await eventService.update({
        id: event.id,
        title: data.title,
        description: data.description,
        location: data.location,
        maxParticipants: data.maxParticipants,
        isCancelled: data.isCancelled,
        allowReviewsNow: data.allowReviewsNow,
      });
      if (response.code === 200 && response.data) {
        onUpdated(response.data.event);
        toast.success(t.adminWorkspace.settingsUpdateSuccess);
      } else {
        toast.error(response.message || t.adminWorkspace.settingsUpdateError);
      }
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof EventSettingsValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || t.adminWorkspace.settingsUpdateError);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.adminWorkspace.settingsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-w-xl" noValidate>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="event-title">{t.adminWorkspace.settingsLabelTitle}</FieldLabel>
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
                  <FieldLabel htmlFor="event-description">{t.adminWorkspace.settingsLabelDescription}</FieldLabel>
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
                  <FieldLabel htmlFor="event-location">{t.adminWorkspace.settingsLabelLocation}</FieldLabel>
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
                  <FieldLabel htmlFor="event-maxParticipants">{t.adminWorkspace.settingsLabelMaxParticipants}</FieldLabel>
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
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                      aria-invalid={fieldState.invalid}
                    />
                    <span className="text-sm">{t.adminWorkspace.settingsMarkCancelled}</span>
                  </label>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="allowReviewsNow"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded"
                      aria-invalid={fieldState.invalid}
                    />
                    <span className="text-sm">{t.adminWorkspace.settingsAllowReviews}</span>
                  </label>
                  <p className="text-xs text-muted-foreground">{t.adminWorkspace.settingsAllowReviewsDesc}</p>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex gap-2">
            <Button type="submit" disabled={isUpdating} className="bg-[#1a5c2a] hover:bg-[#144a22]">
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t.adminWorkspace.settingsSave}
            </Button>
            <Button type="button" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              {t.adminWorkspace.settingsDelete}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
