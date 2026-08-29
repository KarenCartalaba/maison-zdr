"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { reviewService } from "@/services/review.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Star, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating must be at most 5"),
  title: z.string().optional(),
  comment: z.string().min(20, "Review must be at least 20 characters").max(1000, "Review must be at most 1000 characters"),
});

type ReviewValues = z.infer<typeof reviewSchema>;

export default function MyReviewsTab() {
  const [activeFilter, setActiveFilter] = useState<"all" | "5stars">("all");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedPending, setSelectedPending] = useState<any | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleWriteReview = (pendingItem: any) => {
    setSelectedPending(pendingItem);
    form.reset({ rating: 0, title: "", comment: "" });
    setShowWriteModal(true);
  };

  const handleSubmitReview = async (data: ReviewValues) => {
    if (!selectedPending) return;
    setIsSubmitting(true);
    try {
      await reviewService.create({
        eventId: selectedPending.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      });
      setShowWriteModal(false);
      setSelectedPending(null);

      // Refresh data
      const [reviewsRes, pendingRes] = await Promise.all([
        authService.getMyReviews(),
        authService.getPendingReviews(),
      ]);
      setReviews(reviewsRes.data?.reviews ?? []);
      setPending(pendingRes.data?.pending ?? []);

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      toast.success("Review submitted successfully!");
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof ReviewValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || "Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Reviews</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your event reviews and ratings.
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Reviews</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your event reviews and ratings.
        </p>
      </div>

      {/* Waiting on your review */}
      {pending.length > 0 && (
        <div className="rounded-lg border-2 border-dashed border-[#1a5c2a]/30 bg-[#1a5c2a]/5 p-6 mb-8">
          <h3 className="font-semibold text-[#1a5c2a] mb-1">Waiting on your review</h3>
          <p className="text-sm text-muted-foreground mb-4">Share how these nights went while they are still fresh.</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {pending.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-white p-3 min-w-[280px]">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={item.gallery?.[0] || "/images/event-placeholder.jpg"} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#1a5c2a] hover:bg-[#144a22] shrink-0"
                  onClick={() => handleWriteReview(item)}
                >
                  Write
                </Button>
              </div>
            ))}
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
          All Reviews
        </button>
        <button
          onClick={() => setActiveFilter("5stars")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "5stars"
              ? "bg-[#1a5c2a] text-white"
              : "border hover:bg-muted"
          }`}
        >
          5 Stars
        </button>
      </div>

      {/* Reviews list */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm mt-1">Attend events and share your experience.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={review.event?.gallery?.[0] || "/images/event-placeholder.jpg"} alt={review.event?.title || "Event"} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{review.event?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.event?.eventDate ? new Date(review.event.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
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
                      Posted {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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

      {/* Write Review Modal */}
      {showWriteModal && selectedPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                    <img src={selectedPending.gallery?.[0] || "/images/event-placeholder.jpg"} alt={selectedPending.title} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Write a Review</h3>
                    <p className="text-sm text-muted-foreground">{selectedPending.title} - {new Date(selectedPending.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowWriteModal(false)}>
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
                        <FieldLabel>How would you rate your experience?</FieldLabel>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                className={`hover:text-yellow-500 ${
                                  star <= field.value ? "text-yellow-400" : "text-muted"
                                }`}
                              >
                                <Star className="h-6 w-6 fill-current" />
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">Tap to rate</span>
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
                        <FieldLabel htmlFor="review-title">Title (optional)</FieldLabel>
                        <Input
                          {...field}
                          id="review-title"
                          placeholder="Summarize your experience"
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
                        <FieldLabel htmlFor="review-comment">Tell us about your experience</FieldLabel>
                        <Textarea
                          {...field}
                          id="review-comment"
                          placeholder="Share your experience..."
                          rows={4}
                          aria-invalid={fieldState.invalid}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Reviews need to be at least 20 characters.</p>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>

                <div className="flex justify-end gap-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setShowWriteModal(false)}>Back</Button>
                  <Button type="submit" className="bg-[#1a5c2a] hover:bg-[#144a22]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      "Post Review"
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
                <h3 className="font-bold text-[#1a5c2a] text-lg">Review Posted</h3>
                <p className="text-muted-foreground mt-2">Thank you for sharing your experience with us.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
