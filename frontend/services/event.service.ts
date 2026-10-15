import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse, Event, RegistrationData, Review } from "@/types";

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  /** ISO datetime the event ends — review availability is derived from it. */
  endDate: string;
  deadline: string;
  minParticipants: number;
  maxParticipants: number;
  /** Canonical category: FOOD / ARTS / GAMES / MUSIC / PERFORMANCE. */
  eventType?: string;
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

  /**
   * Full catalogue for admin/moderator screens. Uses the moderator endpoint,
   * which (unlike EVENTS.LIST) still returns cancelled and past events —
   * required by the admin list/tables (e.g. "Cancelled" tab, gallery).
   */
  getAllForAdmin: async () => {
    const response = await axiosInstance.get<ApiResponse<{ events: Event[] }>>(
      API_ENDPOINTS.EVENTS.ADMIN_LIST
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

  /**
   * Cancel an event (admin row/card action). Reuses the update endpoint with
   * `isCancelled: true`; the backend refuses once the event has started, so
   * callers should also disable the action for ended events.
   */
  cancel: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse<{ event: Event }>>(
      API_ENDPOINTS.EVENTS.UPDATE,
      { id, isCancelled: true }
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

  getReviews: async (eventId: string) => {
    const response = await axiosInstance.get<
      ApiResponse<{ reviews: Review[]; averageRating: number; totalReviews: number }>
    >(API_ENDPOINTS.EVENTS.REVIEWS(eventId));
    return response.data;
  },
};
