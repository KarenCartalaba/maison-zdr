"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { reviewService } from "@/services/review.service";
import { getErrorMessage } from "@/lib/server-error";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Star, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EventImage from "@/components/ui/event-image";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating must be at most 5"),
  title: z.string().optional(),
  comment: z.string().min(20, "Review must be at least 20 characters").max(1000, "Review must be at most 1000 characters"),
});

type ReviewValues = z.infer<typeof reviewSchema>;

interface MyReviewsTabProps {
  highlightEventId?: string | null;
}

// Consume-once guard that survives tab-switch remounts (ProfileContent
// remounts this tab via tabKey, which would reset a plain ref).
const consumedHighlightEventIds = new Set<string>();

const eventDateFormat = { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" } as const;

export default function MyReviewsTab({ highlightEventId = null }: MyReviewsTabProps) {
  const { t, dateLocale } = useLanguage();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "5stars">("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedPending, setSelectedPending] = useState<any | null>(null);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedPendingId, setHighlightedPendingId] = useState<string | null>(null);
  const highlightConsumedRef = useRef(false);
  const { confirm, dialog } = useConfirm();

  // Real data state
  const [reviews, setReviews] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
    mode: "onChange",
  });

  // Fetch data on mount
  useEffect(() => {
    Promise.all([
      authService.getMyReviews().catch(() => ({ data: { reviews: [] } })),
      authService.getPendingReviews().catch(() => ({ data: { pending: [] } })),
    ]).then(([reviewsRes, pendingRes]) => {
      setReviews(reviewsRes.data?.reviews ?? []);
      setPending(pendingRes.data?.pending ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const filteredReviews = activeFilter === "5stars"
    ? reviews.filter((r: any) => r.rating === 5)
    : reviews;

  const isEditing = editingReview !== null;

  // The modal serves both "write" (pending item) and "edit" (own review);
  // both render the same header image/title/date.
  const modalEvent = editingReview
    ? {
        id: editingReview.event?.id,
        title: editingReview.event?.title,
        eventDate: editingReview.event?.eventDate,
        gallery: editingReview.event?.gallery,
      }
    : selectedPending;

  const closeModal = () => {
    setShowModal(false);
    setSelectedPending(null);
    setEditingReview(null);
  };

  const handleWriteReview = (pendingItem: any) => {
    setEditingReview(null);
    setSelectedPending(pendingItem);
    form.reset({ rating: 0, title: "", comment: "" });
    setShowModal(true);
  };

  // Edit opens the same form prefilled with what the guest already wrote.
  const handleEditReview = (review: any) => {
    setSelectedPending(null);
    setEditingReview(review);
    form.reset({
      rating: review.rating ?? 0,
      title: review.title ?? "",
      comment: review.comment ?? "",
    });
    setShowModal(true);
  };

  // Deep-link consume-once: auto-open the Write modal for the linked event.
  useEffect(() => {
    if (!highlightEventId) return;
    if (highlightConsumedRef.current || consumedHighlightEventIds.has(highlightEventId)) return;
    if (loading) return;
    highlightConsumedRef.current = true;
    consumedHighlightEventIds.add(highlightEventId);
    const match = pending.find(
      (item: any) => item.id === highlightEventId || item.event?.id === highlightEventId
    );
    if (!match) return;
    // Reviews auto-open at the event's END datetime — the only gate.
    const eligible = !!match.endDate && new Date(match.endDate) <= new Date();
    if (eligible) {
      handleWriteReview(match);
    } else {
      setHighlightedPendingId(match.id);
      document
        .getElementById(`pending-${match.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightEventId, loading, pending]);

  // Backend validation errors land on the matching field; anything else is a toast.
  const surfaceSubmitError = (error: any, fallback: string) => {
    if (error?.errors) {
      error.errors.forEach((err: { path: string; message: string }) => {
        const fieldName = err.path.replace("body.", "") as keyof ReviewValues;
        if (fieldName in form.getValues()) {
          form.setError(fieldName, { type: "server", message: err.message });
        }
      });
    } else {
      toast.error(getErrorMessage(error, fallback));
    }
  };

  const handleSubmitReview = async (data: ReviewValues) => {
    if (editingReview) {
      setIsSubmitting(true);
      const title = data.title?.trim() ? data.title.trim() : null;
      try {
        await reviewService.update(editingReview.id, {
          rating: data.rating,
          title,
          comment: data.comment,
        });
        setReviews((prev) =>
          prev.map((r: any) =>
            r.id === editingReview.id
              ? { ...r, rating: data.rating, title, comment: data.comment }
              : r
          )
        );
        closeModal();
        toast.success(t.profile.reviewUpdated);
      } catch (error: any) {
        surfaceSubmitError(error, t.profile.failedUpdateReview);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!selectedPending) return;
    setIsSubmitting(true);
    try {
      await reviewService.create({
        eventId: selectedPending.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      });
      closeModal();

      // Refresh data
      const [reviewsRes, pendingRes] = await Promise.all([
        authService.getMyReviews(),
        authService.getPendingReviews(),
      ]);
      setReviews(reviewsRes.data?.reviews ?? []);
      setPending(pendingRes.data?.pending ?? []);

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      toast.success(t.profile.reviewSubmitted);
    } catch (error: any) {
      surfaceSubmitError(error, t.profile.failedSubmitReview);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optimistic delete: the card leaves the list immediately and is put back
  // at its old position if the server refuses.
  const handleDeleteReview = async (review: any) => {
    const index = reviews.findIndex((r: any) => r.id === review.id);
    setDeletingId(review.id);
    setReviews((prev) => prev.filter((r: any) => r.id !== review.id));
    try {
      await reviewService.remove(review.id);
      // The freed (userId, eventId) slot makes the event reviewable again.
      authService
        .getPendingReviews()
        .then((res) => setPending(res.data?.pending ?? []))
        .catch(() => {});
      // Refresh server-side profile stats so "Reviews Written" follows the delete.
      router.refresh();
      toast.success(t.profile.reviewDeleted);
    } catch (error: any) {
      setReviews((prev) => {
        const next = [...prev];
        next.splice(index < 0 ? next.length : index, 0, review);
        return next;
      });
      toast.error(getErrorMessage(error, t.profile.failedDeleteReview));
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{t.profile.myReviewsHeading}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.profile.myReviewsSubtitle}
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-64 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {dialog}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t.profile.myReviewsHeading}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t.profile.myReviewsSubtitle}
        </p>
      </div>

      {/* Waiting on your review */}
      {pending.length > 0 && (
        <div className="rounded-lg border-2 border-dashed border-[#1a5c2a]/30 bg-[#1a5c2a]/5 p-6 mb-8">
          <h3 className="font-semibold text-[#1a5c2a] mb-1">{t.profile.waitingOnReview}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t.profile.waitingOnReviewDesc}</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {pending.map((item: any) => {
              // Reviews auto-open at the event's END datetime — the only gate.
              const reviewsOpen = !!item.endDate && new Date(item.endDate) <= new Date();
              return (
                <div
                  key={item.id}
                  id={`pending-${item.id}`}
                  className={`flex items-center gap-3 rounded-lg border bg-white p-3 min-w-[280px]${highlightedPendingId === item.id ? " ring-2 ring-[#1a5c2a] border-[#1a5c2a]" : ""}`}
                >
                  <EventImage src={item.gallery?.[0]} title={item.title} className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.eventDate).toLocaleDateString(dateLocale, eventDateFormat)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#1a5c2a] hover:bg-[#144a22] shrink-0"
                    onClick={() => handleWriteReview(item)}
                    disabled={!reviewsOpen}
                    title={reviewsOpen ? undefined : t.profile.reviewsOpenAfter}
                  >
                    {t.profile.write}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "bg-[#1a5c2a] text-white"
              : "border hover:bg-muted"
          }`}
        >
          {t.profile.allReviews}
        </button>
        <button
          onClick={() => setActiveFilter("5stars")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "5stars"
              ? "bg-[#1a5c2a] text-white"
              : "border hover:bg-muted"
          }`}
        >
          {t.profile.fiveStars}
        </button>
      </div>

      {/* Reviews list */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">{t.profile.noReviewsYet}</p>
          <p className="text-sm mt-1">{t.profile.attendAndShare}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review: any) => (
            <Card
              key={review.id}
              className="group relative overflow-hidden transition-all duration-300 hover:border-[#1a5c2a]/40 hover:shadow-md"
            >
              {/* Maison green rail — draws itself down the card edge on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-[#1a5c2a] to-[#144a22] transition-transform duration-300 ease-out group-hover:scale-y-100"
              />
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <EventImage src={review.event?.gallery?.[0]} title={review.event?.title} className="h-14 w-14 rounded-lg shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{review.event?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {review.event?.eventDate ? new Date(review.event.eventDate).toLocaleDateString(dateLocale, eventDateFormat) : ""}
                      </p>
                    </div>
                  </div>

                  {/* Actions sit right of the content on desktop, below it on mobile */}
                  <div className="flex shrink-0 items-center justify-end gap-1">
                    <Link
                      href={`/events/${review.event?.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "mr-1 flex-1 border-[#1a5c2a]/30 text-[#1a5c2a] transition-colors hover:border-[#1a5c2a] hover:bg-[#1a5c2a] hover:text-white sm:flex-none"
                      )}
                    >
                      {t.profile.viewDetails}
                    </Link>
                    <span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground transition-colors hover:bg-[#1a5c2a]/10 hover:text-[#1a5c2a]"
                      aria-label={t.profile.editReview}
                      title={t.profile.editReview}
                      onClick={() => handleEditReview(review)}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={t.profile.deleteReview}
                      title={t.profile.deleteReview}
                      disabled={deletingId === review.id}
                      onClick={() =>
                        confirm({
                          title: t.profile.confirmDeleteReviewTitle,
                          description: t.profile.confirmDeleteReviewDescription.replace("{title}", review.event?.title ?? ""),
                          confirmLabel: t.profile.confirmYesDelete,
                          onConfirm: () => handleDeleteReview(review),
                        })
                      }
                    >
                      {deletingId === review.id ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Trash2 aria-hidden="true" />}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5" role="img" aria-label={`${review.rating}/5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {t.profile.posted} {new Date(review.createdAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {review.title && <h4 className="font-semibold">{review.title}</h4>}
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Write / Edit Review Modal */}
      {showModal && modalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <EventImage src={modalEvent.gallery?.[0]} title={modalEvent.title} className="h-12 w-12 rounded-lg" />
                  <div>
                    <h3 className="text-lg font-bold">{isEditing ? t.profile.editReview : t.profile.writeReview}</h3>
                    <p className="text-sm text-muted-foreground">{modalEvent.title} - {modalEvent.eventDate ? new Date(modalEvent.eventDate).toLocaleDateString(dateLocale, eventDateFormat) : ""}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  ✕
                </Button>
              </div>

              <form onSubmit={form.handleSubmit(handleSubmitReview)} noValidate>
                <FieldGroup>
                  {/* Star Rating */}
                  <Controller
                    name="rating"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>{t.profile.rateExperience}</FieldLabel>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                aria-label={`${star}/5`}
                                aria-pressed={field.value === star}
                                className={`hover:text-yellow-500 ${
                                  star <= field.value ? "text-yellow-400" : "text-muted"
                                }`}
                              >
                                <Star className="h-6 w-6 fill-current" />
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{t.profile.tapToRate}</span>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Title (optional) */}
                  <Controller
                    name="title"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="review-title">{t.profile.titleOptional}</FieldLabel>
                        <Input
                          {...field}
                          id="review-title"
                          placeholder={t.profile.summarizeExperience}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Comment */}
                  <Controller
                    name="comment"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="review-comment">{t.profile.tellAboutExperience}</FieldLabel>
                        <Textarea
                          {...field}
                          id="review-comment"
                          placeholder={t.profile.shareExperience}
                          rows={4}
                          aria-invalid={fieldState.invalid}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{t.profile.reviewMinChars}</p>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>

                <div className="flex justify-end gap-4 mt-6">
                  <Button type="button" variant="outline" onClick={closeModal}>{t.profile.back}</Button>
                  <Button type="submit" className="bg-[#1a5c2a] hover:bg-[#144a22]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.profile.submitting}</>
                    ) : (
                      isEditing ? t.profile.updateReview : t.profile.postReview
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => setShowSuccessAlert(false)}>✕</Button>
              </div>
              <div>
                <h3 className="font-bold text-[#1a5c2a] text-lg">{t.profile.reviewPosted}</h3>
                <p className="text-muted-foreground mt-2">{t.profile.thankYouReview}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}