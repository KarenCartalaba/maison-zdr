import axios from "axios";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: backendURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = `${axiosInstance.defaults.baseURL}/api/auth/v1/refresh-token`;
        await axios.post(refreshUrl, {}, { withCredentials: true });

        processQueue(null);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        isRefreshing = false;

        const refreshStatus = refreshError.response?.status;
        if (refreshStatus === 401 || refreshStatus === 403 || refreshStatus === 400) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    // Attach validation errors for easy access in form catch blocks.
    // Backend returns { errors: [{ path, message }] } on 400.
    // Forms check error.errors — so we flatten it here.
    if (status === 400 && error.response?.data?.errors) {
      error.errors = error.response.data.errors;
      error.message = error.response.data.message || error.message;
    }

    // Attach rate limit message so toast.error(error.message) shows the real reason.
    if (status === 429 && error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
