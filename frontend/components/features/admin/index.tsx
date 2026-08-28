"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const loading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

// Dynamic imports for heavy chart-based components
export const DynamicDashboardContent = dynamic(
  () => import("@/components/features/admin/DashboardContent"),
  { loading, ssr: false }
);

export const DynamicAnalyticsContent = dynamic(
  () => import("@/components/features/admin/AnalyticsContent"),
  { loading, ssr: false }
);

export const DynamicEventsContent = dynamic(
  () => import("@/components/features/admin/AdminEventsContent"),
  { loading, ssr: false }
);

export const DynamicRegistrationsContent = dynamic(
  () => import("@/components/features/admin/RegistrationsContent"),
  { loading, ssr: false }
);

export const DynamicCheckInsContent = dynamic(
  () => import("@/components/features/admin/CheckInsContent"),
  { loading, ssr: false }
);

export const DynamicReviewsContent = dynamic(
  () => import("@/components/features/admin/ReviewsContent"),
  { loading, ssr: false }
);

export const DynamicUsersContent = dynamic(
  () => import("@/components/features/admin/UsersContent"),
  { loading, ssr: false }
);

export const DynamicSettingsContent = dynamic(
  () => import("@/components/features/admin/SettingsContent"),
  { loading, ssr: false }
);

export const DynamicProfileContent = dynamic(
  () => import("@/components/features/admin/ProfileContent"),
  { loading, ssr: false }
);

export const DynamicEventWorkspaceContent = dynamic(
  () => import("@/components/features/admin/EventWorkspaceContent"),
  { loading, ssr: false }
);

export const DynamicCreateEventContent = dynamic(
  () => import("@/components/features/admin/CreateEventContent"),
  { loading, ssr: false }
);

export const DynamicEditEventContent = dynamic(
  () => import("@/components/features/admin/EditEventContent"),
  { loading, ssr: false }
);
