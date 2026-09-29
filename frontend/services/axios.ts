import axios from "axios";

/**
 * Absolute backend URL.
 *
 * The shared browser instance below uses a RELATIVE baseURL so traffic flows
 * through the same-origin /api rewrite proxy (see next.config.ts) — the
 * backend's Set-Cookie then lands as a first-party cookie, so incognito
 * third-party-cookie blocking no longer wipes the session.
 *
 * NOTE: lib/api.ts (server-side, runs on the Vercel server where there is no
 * browser cookie jar) must KEEP using the absolute backend URL — only this
 * browser instance is relative.
 *
 * BACKEND_URL is still exported for the large base64 uploads that bypass the
 * proxy (see gallery.service.ts upload, auth.service.ts updateProfile).
 */
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const axiosInstance = axios.create({
  // Relative baseURL => same-origin requests => Next.js rewrites proxy them
  // to the backend, keeping auth cookies first-party.
  baseURL: "",
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

// ---------------------------------------------------------------------------
// Cross-tab refresh lock (localStorage).
// Refresh tokens are single-use: if two tabs refresh simultaneously they
// race, the loser's token is already rotated and it gets logged out. Only
// the tab holding the lock performs the refresh; other tabs wait for the
// holder (poll) and then replay. Lock carries a timestamp + expiry so a
// dead tab (closed mid-refresh) cannot block others forever; the holder
// clears it in a finally block.
// ---------------------------------------------------------------------------
const REFRESH_LOCK_KEY = "maison-zdr:refresh-lock";
const REFRESH_LOCK_TTL_MS = 10_000; // a lock older than this is stale
const REFRESH_LOCK_WAIT_MS = 8_000; // max time a non-holder waits
const REFRESH_LOCK_POLL_MS = 100;

const acquireRefreshLock = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    if (raw) {
      const ts = Number((JSON.parse(raw) as { ts: number })?.ts ?? raw);
      if (Number.isFinite(ts) && Date.now() - ts < REFRESH_LOCK_TTL_MS) {
        return false; // another tab holds a fresh lock
      }
    }
    localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ ts: Date.now() }));
    return true;
  } catch {
    return true; // localStorage unavailable — proceed without the lock
  }
};

const releaseRefreshLock = () => {
  try {
    localStorage.removeItem(REFRESH_LOCK_KEY);
  } catch {
    // ignore — lock expiry covers cleanup
  }
};

const waitForRefreshLock = async (): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < REFRESH_LOCK_WAIT_MS) {
    try {
      if (!localStorage.getItem(REFRESH_LOCK_KEY)) return; // holder finished
    } catch {
      return;
    }
    await new Promise((r) => setTimeout(r, REFRESH_LOCK_POLL_MS));
  }
  // Timed out (holder may be dead — expiry covers it). The caller replays
  // optimistically; a stale token just 401s once and rejects (no loop,
  // since originalRequest._retry is already set).
};

// The refresh endpoint is same-origin (via the /api proxy), so this stays
// a relative URL.
const REFRESH_URL = "/api/auth/v1/refresh-token";

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
        let isHolder = false;
        try {
          isHolder = acquireRefreshLock();
          if (!isHolder) {
            // Another tab is refreshing — wait for it instead of racing it
            // (single-use refresh tokens), then replay against its session.
            await waitForRefreshLock();
            processQueue(null);
            return;
          }
          try {
            await axios.post(REFRESH_URL, {}, { withCredentials: true });
          } catch (firstError: any) {
            if (!firstError.response) {
              // Network error / timeout / offline — retry the refresh once
              // before giving up (transient blips shouldn't kill sessions).
              await axios.post(REFRESH_URL, {}, { withCredentials: true });
            } else {
              throw firstError;
            }
          }
          processQueue(null);
        } catch (refreshError: any) {
          processQueue(refreshError);
          // Only destroy the session when the backend explicitly rejected
          // the refresh (expired/revoked token). On a network error (no HTTP
          // response — offline/timeout) the session may still be valid, so
          // do NOT redirectToLogin: reject and let the caller show an error.
          const refreshStatus = refreshError.response?.status;
          if (
            refreshStatus === 401 ||
            refreshStatus === 403 ||
            refreshStatus === 404
          ) {
            redirectToLogin();
          }
          throw refreshError;
        } finally {
          if (isHolder) releaseRefreshLock();
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
