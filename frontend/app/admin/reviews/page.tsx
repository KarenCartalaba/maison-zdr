import ReviewsContent from "@/components/features/admin/ReviewsContent";
import { serverFetchAuth } from "@/lib/api";

export default async function AdminReviewsPage() {
  const res = await serverFetchAuth("/api/admin/v1/reviews");

  return (
    <ReviewsContent
      initialReviews={res.data?.reviews ?? null}
      initialStats={res.data?.stats ?? null}
    />
  );
}
