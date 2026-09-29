import axiosInstance, { BACKEND_URL } from "@/services/axios";
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
      // NOTE: large base64 payload (often multi-MB with ~33% base64 bloat).
      // Bypasses the same-origin /api rewrite proxy, which can choke on big
      // bodies (proxy buffering / request-size limits) — hits the backend
      // directly instead. Small calls (e.g. delete below) stay on the proxy.
      `${BACKEND_URL}/api/gallery/v1/upload`,
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
