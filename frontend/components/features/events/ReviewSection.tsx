"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { eventService } from "@/services/event.service";
import ReviewCard from "./ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewSectionProps {
  eventId?: string;
  averageRating?: number;
  totalReviews?: number;
}

export default function ReviewSection({
  eventId,
  averageRating: propAvgRating = 0,
  totalReviews: propTotalReviews = 0,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(propAvgRating);
  const [totalReviews, setTotalReviews] = useState(propTotalReviews);
  const [loading, setLoading] = useState(!!eventId);

  useEffect(() => {
    if (!eventId) return;
    eventService
      .getReviews(eventId)
      .then((res) => {
        if (res.data) {
          setReviews(res.data.reviews);
          setAvgRating(res.data.averageRating);
          setTotalReviews(res.data.totalReviews);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!eventId || totalReviews === 0) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
        </div>
        <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(avgRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold">{avgRating}</span>
          <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            name={review.user?.name || "Anonymous"}
            date={new Date(review.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            rating={review.rating}
            title={review.title}
            comment={review.comment}
          />
        ))}
      </div>
    </div>
  );
}
