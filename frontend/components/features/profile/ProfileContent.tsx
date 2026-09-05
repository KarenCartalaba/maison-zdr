"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import ProfileTabs from "@/components/features/profile/ProfileTabs";
import AccountOverviewCard from "@/components/features/profile/AccountOverviewCard";
import MyEventsTab from "@/components/features/profile/MyEventsTab";
import MyReviewsTab from "@/components/features/profile/MyReviewsTab";
import SettingsTab from "@/components/features/profile/SettingsTab";
import { authService } from "@/services/auth.service";

type Tab = "events" | "reviews" | "settings";

interface ProfileContentProps {
  initialStats?: {
    eventsRegistered: number;
    eventsAttended: number;
    reviewsWritten: number;
    totalGuestsBrought: number;
  } | null;
}

export default function ProfileContent({ initialStats = null }: ProfileContentProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() =>
    searchParams.get("tab") === "reviews" ? "reviews" : "events"
  );
  const highlightEventId = searchParams.get("event");
  const [tabKey, setTabKey] = useState(0);
  const [profileStats, setProfileStats] = useState(initialStats);

  useEffect(() => {
    if (initialStats) return; // Already have SSR data
    authService.getProfileStats().then((res) => {
      if (res.data) setProfileStats(res.data);
    }).catch(() => {});
  }, [initialStats]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setTabKey((prev) => prev + 1);
  }, []);

  const handleEditProfile = useCallback(() => {
    setActiveTab("settings");
    setTabKey((prev) => prev + 1);
  }, []);

  return (
    <div className="container px-4 py-8">
      <ProfileHeader onEditProfile={handleEditProfile} eventsAttended={profileStats?.eventsAttended ?? 0} />
      <div className="my-6 border-t" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="py-6">
            {activeTab === "events" && <MyEventsTab key={`events-${tabKey}`} />}
            {activeTab === "reviews" && <MyReviewsTab key={`reviews-${tabKey}`} highlightEventId={highlightEventId} />}
            {activeTab === "settings" && <SettingsTab key={`settings-${tabKey}`} />}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <AccountOverviewCard />
          </div>
        </div>
      </div>
    </div>
  );
}
