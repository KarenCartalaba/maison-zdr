"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { authService, LoginInput, SignupInput } from "@/services/auth.service";
import { API_ENDPOINTS } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          const response = await authService.getMe();
          if (response.code !== 200 || !response.data) {
            throw new Error("Session invalid");
          }

          setUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (e: any) {
          console.error("Session verification failed", e);

          const status = e.response?.status;
          if (status === 401 || status === 403) {
            setUser(null);
            localStorage.removeItem("user");
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.code === 200 && response.data) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (e: any) {
      console.error("Failed to refresh user:", e);
    }
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  // Cookie-blocked detection: the session lives in httpOnly cookies, so if
  // the browser dropped them (e.g. private/incognito blocking) the user
  // would otherwise be silently logged out on the very next request. Uses a
  // bare axios call (no refresh interceptor) — a 401 here must NOT trigger
  // a refresh + redirectToLogin, or the message below would be lost.
  const verifySessionCookies = async () => {
    try {
      await axios.get(API_ENDPOINTS.AUTH.ME, { withCredentials: true });
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 401 || status === 403) {
        setUser(null);
        localStorage.removeItem("user");
        const cookieError: any = new Error(
          "Login succeeded, but your browser blocked the session cookies, so you were signed out right away. " +
            "This often happens in private/incognito windows that block cookies. " +
            "Please allow cookies for this site — or use a regular (non-private) window — and try again."
        );
        cookieError.cookieBlocked = true;
        throw cookieError;
      }
      // Network hiccup (no HTTP response) — leave the fresh login intact;
      // later requests surface real problems via the normal refresh flow.
    }
  };

  const login = async (data: LoginInput) => {
    try {
      const response = await authService.login(data);
      if (response.code === 200 && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        await verifySessionCookies();

        if (userData.role === "ADMIN" || userData.role === "MODERATOR") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        const error: any = new Error(response.message || "Login failed");
        error.message = response.message;
        throw error;
      }
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      const message = error.response?.data?.message || error.message || "An unexpected error occurred";
      const authError: any = new Error(message);
      authError.message = message;
      authError.errors = serverErrors;
      // Preserve the HTTP status: callers (e.g. LoginForm's 429 cooldown)
      // only receive this thrown error, not the raw axios error.
      authError.status = error.response?.status;
      // Rate-limit window left, in seconds (express-rate-limit's Retry-After
      // on 429). Same-origin /api proxy ⇒ not a CORS-restricted header, so
      // callers can wait out the real window instead of guessing.
      if (authError.status === 429) {
        const retryAfter = Number(error.response?.headers?.["retry-after"]);
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          authError.retryAfter = Math.ceil(retryAfter);
        }
      }
      throw authError;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      const response = await authService.googleLogin(idToken);
      if (response.code === 200 && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        await verifySessionCookies();

        if (userData.role === "ADMIN" || userData.role === "MODERATOR") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        const error: any = new Error(response.message || "Google login failed");
        error.message = response.message;
        throw error;
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Google login failed";
      const authError: any = new Error(message);
      authError.message = message;
      authError.status = error.response?.status;
      throw authError;
    }
  };

  const signup = async (data: SignupInput) => {
    try {
      const response = await authService.signup(data);
      if (response.code === 201 || response.code === 200) {
        toast.success("Account created! Please verify your email.");
        router.push("/login");
      } else {
        const error: any = new Error(response.message || "Signup failed");
        error.message = response.message;
        throw error;
      }
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      const message = error.response?.data?.message || error.message || "An unexpected error occurred";
      const authError: any = new Error(message);
      authError.message = message;
      authError.errors = serverErrors;
      authError.status = error.response?.status;
      throw authError;
    }
  };

  const logout = async () => {
    let serverOk = false;
    try {
      await authService.logout();
      serverOk = true;
    } catch (error) {
      console.error("Logout server error", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      if (serverOk) {
        toast.success("Logged out successfully");
      } else {
        toast.warning(t.auth.logoutFailed);
      }
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        refreshUser,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role?.toUpperCase() === "ADMIN",
        isModerator: user?.role?.toUpperCase() === "MODERATOR",
        isVerified: !!user?.emailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
