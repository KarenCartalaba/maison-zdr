"use client";

import { useRef, useState } from "react";
import { Camera, Calendar, User, BadgeCheck, Pencil, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

interface ProfileHeaderProps {
  onEditProfile?: () => void;
  eventsAttended?: number;
}

export default function ProfileHeader({ onEditProfile, eventsAttended = 0 }: ProfileHeaderProps) {
  const { user, isVerified, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await authService.updateProfile({ imageBase64: reader.result as string });
          await refreshUser();
          toast.success("Profile picture updated");
        } catch {
          toast.error("Failed to update profile picture");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to read file");
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-6">
        {/* Profile Photo */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-muted overflow-hidden">
            <img
              src={user?.profilePic || "/images/profile-placeholder.jpg"}
              alt={user?.name || "Profile"}
              className="h-full w-full object-cover"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePicChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a5c2a] text-white shadow-md disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
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
              {eventsAttended} Events Attended
            </span>
            {memberSince && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Member Since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onEditProfile} className="gap-2">
        <Pencil className="h-4 w-4" />
        Edit Profile
      </Button>
    </div>
  );
}
