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
  { loading }
);

export const DynamicAnalyticsContent = dynamic(
  () => import("@/components/features/admin/AnalyticsContent"),
  { loading }
);

export const DynamicEventsContent = dynamic(
  () => import("@/components/features/admin/AdminEventsContent"),
  { loading }
);

export const DynamicRegistrationsContent = dynamic(
  () => import("@/components/features/admin/RegistrationsContent"),
  { loading }
);

export const DynamicCheckInsContent = dynamic(
  () => import("@/components/features/admin/CheckInsContent"),
  { loading }
);

export const DynamicReviewsContent = dynamic(
  () => import("@/components/features/admin/ReviewsContent"),
  { loading }
);

export const DynamicUsersContent = dynamic(
  () => import("@/components/features/admin/UsersContent"),
  { loading }
);

export const DynamicSettingsContent = dynamic(
  () => import("@/components/features/admin/SettingsContent"),
  { loading }
);

export const DynamicProfileContent = dynamic(
  () => import("@/components/features/admin/ProfileContent"),
  { loading }
);

export const DynamicEventWorkspaceContent = dynamic(
  () => import("@/components/features/admin/EventWorkspaceContent"),
  { loading }
);

export const DynamicCreateEventContent = dynamic(
  () => import("@/components/features/admin/CreateEventContent"),
  { loading }
);

export const DynamicEditEventContent = dynamic(
  () => import("@/components/features/admin/EditEventContent"),
  { loading }
);
