import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse, News } from "@/types";

export interface CreateNewsData {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  isPublished?: boolean;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {
  id: string;
}

export const newsService = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<{ news: News[] }>>(
      API_ENDPOINTS.NEWS.LIST
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<{ news: News }>>(
      API_ENDPOINTS.NEWS.GET(id)
    );
    return response.data;
  },

  create: async (data: CreateNewsData) => {
    const response = await axiosInstance.post<ApiResponse<{ news: News }>>(
      API_ENDPOINTS.NEWS.CREATE,
      data
    );
    return response.data;
  },

  update: async (data: UpdateNewsData) => {
    const response = await axiosInstance.post<ApiResponse<{ news: News }>>(
      API_ENDPOINTS.NEWS.UPDATE,
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.NEWS.DELETE,
      { id }
    );
    return response.data;
  },
};
