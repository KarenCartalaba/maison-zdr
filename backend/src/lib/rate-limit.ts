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

// Global: 100 requests per minute — for all API routes (generous for admin dashboards)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { code: 429, status: "error", message: "Too many requests. Please slow down." },
});
