"use client";

import { useState } from "react";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import ProfileTabs from "@/components/features/profile/ProfileTabs";
import AccountOverviewCard from "@/components/features/profile/AccountOverviewCard";
import MyEventsTab from "@/components/features/profile/MyEventsTab";
import MyReviewsTab from "@/components/features/profile/MyReviewsTab";
import SettingsTab from "@/components/features/profile/SettingsTab";

type Tab = "events" | "reviews" | "settings";

export default function ProfileContent() {
  const [activeTab, setActiveTab] = useState<Tab>("events");

  return (
    <div className="container px-4 py-8">
      <ProfileHeader />
      <div className="my-6 border-t" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="py-6">
            {activeTab === "events" && <MyEventsTab />}
            {activeTab === "reviews" && <MyReviewsTab />}
            {activeTab === "settings" && <SettingsTab />}
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
