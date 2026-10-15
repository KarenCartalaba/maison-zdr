import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse, Review } from "@/types";

export interface CreateReviewData {
  eventId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewData {
  rating: number;
  /** null clears a previously saved title */
  title?: string | null;
  comment: string;
}

// Owner-scoped endpoints (auth-guarded, 403 on someone else's review).
// Paths are built here like auth.service.ts does, so the review endpoints
// live next to the rest of the review API surface.
const ownReview = (reviewId: string) => `/api/reviews/v1/${reviewId}`;

export const reviewService = {
  create: async (data: CreateReviewData) => {
    const response = await axiosInstance.post<ApiResponse<{ review: Review }>>(
      API_ENDPOINTS.REVIEWS.CREATE,
      data
    );
    return response.data;
  },

  update: async (reviewId: string, data: UpdateReviewData) => {
    const response = await axiosInstance.patch<ApiResponse<{ review: Review }>>(
      ownReview(reviewId),
      data
    );
    return response.data;
  },

  remove: async (reviewId: string) => {
    const response = await axiosInstance.delete<ApiResponse>(ownReview(reviewId));
    return response.data;
  },
};