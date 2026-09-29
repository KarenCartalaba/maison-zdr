import axiosInstance, { BACKEND_URL } from "@/services/axios";
import { z } from "zod";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse, LoginResponse, User } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[0-9]/, "Must contain one number"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export const authService = {
  login: async (data: LoginInput) => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      { idToken }
    );
    return response.data;
  },

  signup: async (data: SignupInput) => {
    const response = await axiosInstance.post<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    );
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.LOGOUT
    );
    return response.data;
  },

  refreshToken: async () => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axiosInstance.get<ApiResponse>(
      `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`
    );
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await axiosInstance.put<ApiResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      { currentPassword, newPassword }
    );
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string; phone?: string; imageBase64?: string }) => {
    // NOTE: small JSON edits (name/email/phone) go through the same-origin
    // /api proxy (first-party cookies). A base64 profile picture is a large
    // payload (often multi-MB) that can choke the rewrite proxy (buffering /
    // request-size limits), so only that case hits the backend directly.
    const url = data.imageBase64
      ? `${BACKEND_URL}${API_ENDPOINTS.PROFILE.UPDATE}`
      : API_ENDPOINTS.PROFILE.UPDATE;
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(
      url,
      data
    );
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await axiosInstance.get<ApiResponse<{ registrations: any[] }>>(
      "/api/registrations/v1/mine"
    );
    return response.data;
  },

  getProfileStats: async () => {
    const response = await axiosInstance.get<ApiResponse<{
      eventsRegistered: number;
      eventsAttended: number;
      reviewsWritten: number;
      totalGuestsBrought: number;
    }>>("/api/profile/v1/stats");
    return response.data;
  },

  getMyReviews: async () => {
    const response = await axiosInstance.get<ApiResponse<{ reviews: any[] }>>(
      "/api/reviews/v1/mine"
    );
    return response.data;
  },

  getPendingReviews: async () => {
    const response = await axiosInstance.get<ApiResponse<{ pending: any[] }>>(
      "/api/reviews/v1/pending"
    );
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password }
    );
    return response.data;
  },

  validateResetToken: async (token: string) => {
    const response = await axiosInstance.get<ApiResponse>(
      `${API_ENDPOINTS.AUTH.RESET_PASSWORD}?token=${encodeURIComponent(token)}`
    );
    return response.data;
  },
};
