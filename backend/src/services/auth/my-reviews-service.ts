import { ReviewRepository } from "@/repositories/review.repository";

const reviewRepo = new ReviewRepository();

export async function MyReviewsService(userId: string) {
  try {
    const reviews = await reviewRepo.findByUser(userId);

    return {
      code: 200,
      status: "success",
      data: { reviews },
    };
  } catch (error) {
    console.error("MyReviewsService error", error);
    return { code: 500, status: "error", message: "Failed to fetch reviews" };
  }
}
