import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type {
  ApiResponse,
  AdminRegistration,
  RegistrationStats,
  AdminReview,
  ReviewStats,
  AdminUser,
  UserStats,
  AnalyticsOverview,
  CheckInEvent,
} from "@/types";

export const adminService = {
  // Registrations
  getRegistrations: async (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "ALL")
      params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get<
      ApiResponse<{
        registrations: AdminRegistration[];
        stats: RegistrationStats;
      }>
    >(`${API_ENDPOINTS.ADMIN.REGISTRATIONS}${query}`);
    return response.data;
  },

  updateRegistrationStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put<ApiResponse>(
      API_ENDPOINTS.ADMIN.REGISTRATION_STATUS(id),
      { status }
    );
    return response.data;
  },

  // Check-ins
  getCheckInEvents: async () => {
    const response = await axiosInstance.get<
      ApiResponse<{ events: CheckInEvent[] }>
    >(API_ENDPOINTS.ADMIN.CHECKIN_EVENTS);
    return response.data;
  },

  getEventCheckIn: async (eventId: string) => {
    const response = await axiosInstance.get<
      ApiResponse<{
        event: any;
        checkedInCount: number;
        totalCount: number;
        registrations: AdminRegistration[];
      }>
    >(API_ENDPOINTS.ADMIN.CHECKIN_EVENT(eventId));
    return response.data;
  },

  checkIn: async (registrationId: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.ADMIN.CHECKIN(registrationId)
    );
    return response.data;
  },

  // Reviews
  getReviews: async (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "ALL")
      params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get<
      ApiResponse<{ reviews: AdminReview[]; stats: ReviewStats }>
    >(`${API_ENDPOINTS.ADMIN.REVIEWS}${query}`);
    return response.data;
  },

  updateReviewStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put<ApiResponse>(
      API_ENDPOINTS.ADMIN.REVIEW_STATUS(id),
      { status }
    );
    return response.data;
  },

  replyToReview: async (id: string, reply: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.ADMIN.REVIEW_REPLY(id),
      { reply }
    );
    return response.data;
  },

  // Users
  getUsers: async (filters?: { role?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.role && filters.role !== "ALL")
      params.set("role", filters.role);
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get<
      ApiResponse<{ users: AdminUser[]; stats: UserStats }>
    >(`${API_ENDPOINTS.ADMIN.USERS}${query}`);
    return response.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await axiosInstance.put<ApiResponse>(
      API_ENDPOINTS.ADMIN.USER_ROLE(id),
      { role }
    );
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response =
      await axiosInstance.get<ApiResponse<AnalyticsOverview>>(
        API_ENDPOINTS.ADMIN.ANALYTICS
      );
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await axiosInstance.get<ApiResponse<{
      totalEvents: number;
      totalRegistrations: number;
      ongoingEvents: number;
      cancelledEvents: number;
    }>>(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
    return response.data;
  },

  getRegistrationTrend: async () => {
    const response = await axiosInstance.get<ApiResponse<{
      trend: { month: string; registrations: number }[];
    }>>(API_ENDPOINTS.ADMIN.DASHBOARD_REG_TREND);
    return response.data;
  },

  getRegistrationStatus: async () => {
    const response = await axiosInstance.get<ApiResponse<{
      status: { name: string; value: number; fill: string }[];
    }>>(API_ENDPOINTS.ADMIN.DASHBOARD_REG_STATUS);
    return response.data;
  },

  getAttendanceTrend: async () => {
    const response = await axiosInstance.get<ApiResponse<{
      trend: { month: string; registered: number; attended: number }[];
    }>>(API_ENDPOINTS.ADMIN.DASHBOARD_ATTENDANCE);
    return response.data;
  },

  getTopCategories: async () => {
    const response = await axiosInstance.get<ApiResponse<{
      categories: { name: string; value: number }[];
    }>>(API_ENDPOINTS.ADMIN.DASHBOARD_CATEGORIES);
    return response.data;
  },

  getUpcomingEvents: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    const response = await axiosInstance.get<ApiResponse<{
      events: any[];
    }>>(`${API_ENDPOINTS.ADMIN.DASHBOARD_UPCOMING}${query}`);
    return response.data;
  },

  getRecentRegistrations: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    const response = await axiosInstance.get<ApiResponse<{
      registrations: any[];
    }>>(`${API_ENDPOINTS.ADMIN.DASHBOARD_RECENT}${query}`);
    return response.data;
  },

  getTopEvents: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    const response = await axiosInstance.get<ApiResponse<{
      events: { title: string; registrations: number; fillRate: number; rating: number }[];
    }>>(`${API_ENDPOINTS.ADMIN.DASHBOARD_TOP}${query}`);
    return response.data;
  },
};
