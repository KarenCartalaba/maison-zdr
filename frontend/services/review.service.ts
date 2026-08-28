import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse, Review } from "@/types";

export interface CreateReviewData {
  eventId: string;
  rating: number;
  title?: string;
  comment: string;
}

export const reviewService = {
  create: async (data: CreateReviewData) => {
    const response = await axiosInstance.post<ApiResponse<{ review: Review }>>(
      API_ENDPOINTS.REVIEWS.CREATE,
      data
    );
    return response.data;
  },
};
