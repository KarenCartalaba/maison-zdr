"use client";

import { CalendarDays, Star, Settings } from "lucide-react";

type Tab = "events" | "reviews" | "settings";

interface ProfileTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: "events" as const, label: "My Events", icon: CalendarDays },
  { id: "reviews" as const, label: "My Reviews", icon: Star },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex gap-6 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
