"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { authService } from "@/services/auth.service";
import { Badge } from "@/components/ui/badge";

export default function AccountOverviewCard() {
  const { isVerified } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    eventsRegistered: 0,
    eventsAttended: 0,
    reviewsWritten: 0,
    totalGuestsBrought: 0,
  });

  useEffect(() => {
    authService.getProfileStats().then((res) => {
      if (res.data) setStats(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="rounded-lg border shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a5c2a] px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-semibold">{t.profile.accountOverview}</h3>
        <Badge
          variant="outline"
          className={`${
            isVerified
              ? "bg-white/20 text-white border-white/30"
              : "bg-white/20 text-white border-white/30"
          }`}
        >
          {isVerified ? t.profile.verifiedUser : t.profile.unverifiedUser}
        </Badge>
      </div>

      {/* Stats */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t.profile.eventsRegistered}</span>
          <span className="font-semibold">{stats.eventsRegistered}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t.profile.eventsAttendedCount}</span>
          <span className="font-semibold">{stats.eventsAttended}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t.profile.reviewsWritten}</span>
          <span className="font-semibold">{stats.reviewsWritten}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t.profile.totalGuestsBrought}</span>
          <span className="font-semibold">{stats.totalGuestsBrought}</span>
        </div>
      </div>
    </div>
  );
}
