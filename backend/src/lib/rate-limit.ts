import { rateLimit } from "express-rate-limit";

// Strict: 5 requests per 15 minutes — for sensitive auth endpoints
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many attempts. Please try again later." },
});

// Moderate: 10 requests per 15 minutes — for less sensitive auth endpoints
export const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many requests. Please try again later." },
});

// Auth: 30 requests per 15 minutes — for anonymous auth endpoints (signup,
// password flows, resend-verification, google-login, refresh, logout).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many attempts. Please try again later." },
});

// Login: 10 requests per 15 minutes — stricter tier only for credential login
// to blunt credential-stuffing without locking out legitimate auth flows.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many login attempts. Please try again later." },
});

// Global: 100 requests per minute — for all API routes (generous for admin dashboards)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many requests. Please slow down." },
});
