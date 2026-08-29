"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, LoginInput, SignupInput } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const login = async (data: LoginInput) => {
    try {
      const response = await authService.login(data);
      if (response.code === 200 && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

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
      throw authError;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
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
