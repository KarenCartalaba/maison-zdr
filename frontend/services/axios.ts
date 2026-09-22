import axios from "axios";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: backendURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Shared refresh-promise lock: concurrent 401s share one refresh call. */
let refreshPromise: Promise<void> | null = null;
let failedQueue: Array<{ resolve: () => void; reject: (err: any) => void }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      if (refreshPromise) {
        // Another refresh is in flight — queue behind it.
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;

      // Start a single refresh call shared by all concurrent 401s.
      refreshPromise = (async () => {
        try {
          const refreshUrl = `${axiosInstance.defaults.baseURL}/api/auth/v1/refresh-token`;
          await axios.post(refreshUrl, {}, { withCredentials: true });
          processQueue(null);
        } catch (refreshError: any) {
          processQueue(refreshError);
          redirectToLogin();
          throw refreshError;
        } finally {
          refreshPromise = null;
        }
      })();

      try {
        await refreshPromise;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
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
