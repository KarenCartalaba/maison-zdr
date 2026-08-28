"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Pencil, Trash2 } from "lucide-react";

interface PendingReview {
  id: string;
  eventTitle: string;
  eventDate: string;
  imageUrl: string;
}

interface UserReview {
  id: string;
  eventTitle: string;
  eventDate: string;
  imageUrl: string;
  rating: number;
  postedDate: string;
  title: string;
  comment: string;
}

const MOCK_PENDING: PendingReview[] = [
  { id: "1", eventTitle: "Cocktail Night", eventDate: "Wednesday 7:00 pm - 10:00pm", imageUrl: "/images/event-2.jpg" },
  { id: "2", eventTitle: "Cocktail Night", eventDate: "Wednesday 7:00 pm - 10:00pm", imageUrl: "/images/event-2.jpg" },
];

const MOCK_REVIEWS: UserReview[] = [
  {
    id: "1",
    eventTitle: "Cocktail Night",
    eventDate: "Wednesday 7:00 pm - 10:00pm",
    imageUrl: "/images/event-2.jpg",
    rating: 5,
    postedDate: "July 28, 2026",
    title: "The string lights alone were worth the trip",
    comment: "Every stall felt curated rather than crowded, and the staff kept the walkways moving without it ever feeling rushed. I brought three friends and all of them asked when the next one is. Check-in took under a minute with the QR pass.",
  },
  {
    id: "2",
    eventTitle: "Cocktail Night",
    eventDate: "Wednesday 7:00 pm - 10:00pm",
    imageUrl: "/images/event-2.jpg",
    rating: 5,
    postedDate: "July 28, 2026",
    title: "The string lights alone were worth the trip",
    comment: "Every stall felt curated rather than crowded, and the staff kept the walkways moving without it ever feeling rushed. I brought three friends and all of them asked when the next one is. Check-in took under a minute with the QR pass.",
  },
  {
    id: "3",
    eventTitle: "Cocktail Night",
    eventDate: "Wednesday 7:00 pm - 10:00pm",
    imageUrl: "/images/event-2.jpg",
    rating: 5,
    postedDate: "July 28, 2026",
    title: "The string lights alone were worth the trip",
    comment: "Every stall felt curated rather than crowded, and the staff kept the walkways moving without it ever feeling rushed. I brought three friends and all of them asked when the next one is. Check-in took under a minute with the QR pass.",
  },
];

export default function MyReviewsTab() {
  const [activeFilter, setActiveFilter] = useState<"all" | "5stars">("all");
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingReview | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const filteredReviews = activeFilter === "5stars"
    ? MOCK_REVIEWS.filter((r) => r.rating === 5)
    : MOCK_REVIEWS;

  const handleWriteReview = (pending: PendingReview) => {
    setSelectedPending(pending);
    setShowWriteModal(true);
  };

  const handleSubmitReview = () => {
    setShowWriteModal(false);
    setSelectedPending(null);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Reviews</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your event reviews and ratings.
        </p>
      </div>

      {/* Waiting on your review */}
      {MOCK_PENDING.length > 0 && (
        <div className="rounded-lg border-2 border-dashed border-[#1a5c2a]/30 bg-[#1a5c2a]/5 p-6 mb-8">
          <h3 className="font-semibold text-[#1a5c2a] mb-1">Waiting on your review</h3>
          <p className="text-sm text-muted-foreground mb-4">Share how these nights went while they are still fresh.</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {MOCK_PENDING.map((pending) => (
              <div key={pending.id} className="flex items-center gap-3 rounded-lg border bg-white p-3 min-w-[280px]">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={pending.imageUrl} alt={pending.eventTitle} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{pending.eventTitle}</p>
                  <p className="text-xs text-muted-foreground">{pending.eventDate}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#1a5c2a] hover:bg-[#144a22] shrink-0"
                  onClick={() => handleWriteReview(pending)}
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
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={review.imageUrl} alt={review.eventTitle} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{review.eventTitle}</p>
                  <p className="text-sm text-muted-foreground">{review.eventDate}</p>
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
                  <span className="text-sm text-muted-foreground">Posted {review.postedDate}</span>
                </div>
                <h4 className="font-semibold">{review.title}</h4>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Write Review Modal */}
      {showWriteModal && selectedPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                    <img src={selectedPending.imageUrl} alt={selectedPending.eventTitle} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Write a Review</h3>
                    <p className="text-sm text-muted-foreground">{selectedPending.eventTitle} - {selectedPending.eventDate}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowWriteModal(false)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How would you rate your experience?</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="text-yellow-400 hover:text-yellow-500">
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">Tap to rate</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tell us about your experience</h4>
                  <textarea
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Share your experience..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Reviews need to be at least 20 characters.</p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowWriteModal(false)}>Back</Button>
                <Button className="bg-[#1a5c2a] hover:bg-[#144a22]" onClick={handleSubmitReview}>Post Review</Button>
              </div>
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
