import axiosInstance from "@/services/axios";
import type { ApiResponse } from "@/types";

export interface GalleryImage {
  id: string;
  url: string;
  eventId?: string;
  createdAt: string;
}

export const galleryService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<{ images: GalleryImage[] }>>(
      "/api/gallery/v1/all"
    );
    return response.data;
  },

  upload: async (eventId: string, imageUrl: string) => {
    const response = await axiosInstance.post<ApiResponse<{ image: GalleryImage }>>(
      "/api/gallery/v1/upload",
      { eventId, imageUrl }
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      "/api/gallery/v1/delete",
      { id }
    );
    return response.data;
  },
};
