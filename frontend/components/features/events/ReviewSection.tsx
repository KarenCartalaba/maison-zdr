import { Star } from "lucide-react";
import ReviewCard from "./ReviewCard";

const MOCK_REVIEWS = [
  {
    id: "1",
    name: "Jellie Anne",
    date: "July 27, 2026",
    rating: 5,
    title: "Warm atmosphere, terrific music",
    comment: "Warm atmosphere, terrific music, and the staff made everyone feel welcome.",
  },
  {
    id: "2",
    name: "Karen Jean",
    date: "July 27, 2026",
    rating: 5,
    title: "Warm atmosphere, terrific music",
    comment: "Warm atmosphere, terrific music, and the staff made everyone feel welcome.",
  },
  {
    id: "3",
    name: "Jack Tura",
    date: "July 27, 2026",
    rating: 5,
    title: "Warm atmosphere, terrific music",
    comment: "Warm atmosphere, terrific music, and the staff made everyone feel welcome.",
  },
];

interface ReviewSectionProps {
  averageRating?: number;
  totalReviews?: number;
}

export default function ReviewSection({
  averageRating = 4.7,
  totalReviews = 3,
}: ReviewSectionProps) {
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
                  i < Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold">{averageRating}</span>
          <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_REVIEWS.map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </div>
    </div>
  );
}
