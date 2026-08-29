import axiosInstance from "@/services/axios";
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
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      data
    );
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await axiosInstance.get<ApiResponse<{ registrations: any[] }>>(
      "/api/auth/v1/my-registrations"
    );
    return response.data;
  },

  getProfileStats: async () => {
    const response = await axiosInstance.get<ApiResponse<{
      eventsRegistered: number;
      eventsAttended: number;
      reviewsWritten: number;
      totalGuestsBrought: number;
    }>>("/api/auth/v1/profile-stats");
    return response.data;
  },

  getMyReviews: async () => {
    const response = await axiosInstance.get<ApiResponse<{ reviews: any[] }>>(
      "/api/auth/v1/my-reviews"
    );
    return response.data;
  },

  getPendingReviews: async () => {
    const response = await axiosInstance.get<ApiResponse<{ pending: any[] }>>(
      "/api/auth/v1/pending-reviews"
    );
    return response.data;
  },
};
