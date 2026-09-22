import axiosInstance from "@/services/axios";
import type { ApiResponse } from "@/types";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export const galleryService = {
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
