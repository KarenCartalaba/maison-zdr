import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse, Registration } from "@/types";

export const registrationService = {
  register: async (eventId: string, hasPlusOne: boolean, guestName?: string) => {
    const response = await axiosInstance.post<ApiResponse<{ registration: Registration }>>(
      API_ENDPOINTS.REGISTRATIONS.REGISTER,
      { eventId, hasPlusOne, guestName }
    );
    return response.data;
  },

  cancel: async (eventId: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.REGISTRATIONS.CANCEL,
      { eventId }
    );
    return response.data;
  },

  getByUser: async (userId: string) => {
    const response = await axiosInstance.get<ApiResponse<{ registrations: Registration[] }>>(
      API_ENDPOINTS.REGISTRATIONS.BY_USER(userId)
    );
    return response.data;
  },

  getByEvent: async (eventId: string) => {
    const response = await axiosInstance.get<ApiResponse<{ registrations: Registration[] }>>(
      API_ENDPOINTS.REGISTRATIONS.BY_EVENT(eventId)
    );
    return response.data;
  },
};
