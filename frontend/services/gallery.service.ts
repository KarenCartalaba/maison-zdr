import axiosInstance from "@/services/axios";
import type { ApiResponse } from "@/types";

export interface GalleryImage {
  id: string;
  url: string;
  eventId?: string;
  createdAt: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export const galleryService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<{ images: GalleryImage[] }>>(
      "/api/gallery/v1/all"
    );
    return response.data;
  },

  upload: async (data: { imageBase64: string; folder?: string }) => {
    const response = await axiosInstance.post<ApiResponse<UploadResult>>(
      "/api/gallery/v1/upload",
      data
    );
    return response.data;
  },

  delete: async (data: { url?: string; publicId?: string }) => {
    const response = await axiosInstance.post<ApiResponse>(
      "/api/gallery/v1/delete",
      data
    );
    return response.data;
  },
};
