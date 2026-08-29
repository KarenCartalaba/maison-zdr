"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  mode?: "GUEST" | "PRIVATE" | "VERIFIED" | "ADMIN";
}

export function AuthGuard({ children, mode = "PRIVATE" }: AuthGuardProps) {
  const { isLoading, isAuthenticated, isAdmin, isModerator, isVerified } = useAuth();
  const router = useRouter();

  const hasAdminAccess = isAdmin || isModerator;

  useEffect(() => {
    if (isLoading) return;

    if (mode === "GUEST" && isAuthenticated) {
      if (hasAdminAccess) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else if (mode === "PRIVATE" && !isAuthenticated) {
      router.push("/login");
    } else if (mode === "VERIFIED" && !isAuthenticated) {
      router.push("/login");
    } else if (mode === "VERIFIED" && isAuthenticated && !isVerified) {
      router.push("/");
    } else if (mode === "ADMIN" && !hasAdminAccess) {
      if (isAuthenticated) {
        router.push("/");
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, hasAdminAccess, isVerified, mode, router]);

  // Show loading while checking auth or if redirecting
  if (
    isLoading ||
    (mode === "GUEST" && isAuthenticated) ||
    (mode === "PRIVATE" && !isAuthenticated) ||
    (mode === "VERIFIED" && (!isAuthenticated || !isVerified)) ||
    (mode === "ADMIN" && !hasAdminAccess)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a5c2a] border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
