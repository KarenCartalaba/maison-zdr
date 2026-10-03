import axiosInstance from "@/services/axios";
import { downscaleDataUrl } from "@/lib/image";
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
    // Same-origin /api proxy so the httpOnly session cookie (host-only on the
    // frontend domain) is actually sent — hitting the backend URL directly
    // dropped it and every admin event-image upload came back
    // 401 "Authentication required".
    //
    // Large multi-MB originals used to be the reason for that bypass; they are
    // now downscaled client-side (<1MB, see lib/image.ts) so the proxy body
    // stays small. Small payloads are forwarded untouched.
    const imageBase64 = await downscaleDataUrl(data.imageBase64);
    const response = await axiosInstance.post<ApiResponse<UploadResult>>(
      "/api/gallery/v1/upload",
      { ...data, imageBase64 }
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
