"use client";

import { Camera, Calendar, User, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  onEditProfile?: () => void;
}

export default function ProfileHeader({ onEditProfile }: ProfileHeaderProps) {
  const { user, isVerified } = useAuth();

  const memberSince = "July 2026";

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-6">
        {/* Profile Photo */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-muted overflow-hidden">
            <img
              src="/images/profile-placeholder.jpg"
              alt={user?.name || "Profile"}
              className="h-full w-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a5c2a] text-white shadow-md">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{user?.name || "User"}</h1>
            {isVerified && (
              <BadgeCheck className="h-6 w-6 text-[#1a5c2a] fill-[#1a5c2a]/20" />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              5 Events Attended
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Member Since {memberSince}
            </span>
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onEditProfile}>
        <span className="mr-2">✏️</span>
        Edit Profile
      </Button>
    </div>
  );
}
