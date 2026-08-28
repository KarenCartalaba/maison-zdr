import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse } from "@/types";

export interface ContactData {
  name: string;
  email: string;
  message: string;
}

export const contactService = {
  send: async (data: ContactData) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.CONTACT.SEND,
      data
    );
    return response.data;
  },
};
