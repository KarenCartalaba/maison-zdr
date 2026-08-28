import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse, Event, RegistrationData } from "@/types";

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  deadline: string;
  minParticipants: number;
  maxParticipants: number;
  gallery?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
  isCancelled?: boolean;
}

export const eventService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<{ events: Event[] }>>(
      API_ENDPOINTS.EVENTS.LIST
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<{ event: Event }>>(
      API_ENDPOINTS.EVENTS.GET(id)
    );
    return response.data;
  },

  create: async (data: CreateEventData) => {
    const response = await axiosInstance.post<ApiResponse<{ event: Event }>>(
      API_ENDPOINTS.EVENTS.CREATE,
      data
    );
    return response.data;
  },

  update: async (data: UpdateEventData) => {
    const response = await axiosInstance.post<ApiResponse<{ event: Event }>>(
      API_ENDPOINTS.EVENTS.UPDATE,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.EVENTS.DELETE,
      { id }
    );
    return response.data;
  },

  getRegistrations: async (eventId: string) => {
    const response = await axiosInstance.get<ApiResponse<RegistrationData>>(
      API_ENDPOINTS.REGISTRATIONS.BY_EVENT(eventId)
    );
    return response.data;
  },
};
