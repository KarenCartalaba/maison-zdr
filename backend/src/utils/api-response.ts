export interface ApiResponse<T = any> {
  code: number;
  status: "success" | "error";
  message: string;
  data?: T;
}

export function successResponse<T>(code: number, message: string, data?: T): ApiResponse<T> {
  return { code, status: "success", message, data };
}

export function errorResponse(code: number, message: string): ApiResponse {
  return { code, status: "error", message };
}
