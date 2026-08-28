"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function SettingsTab() {
  const { user, refreshUser, isVerified } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // TODO: Implement profile update API call
      // await authService.updateProfile({ name: `${formData.firstName} ${formData.lastName}` });
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      // TODO: Implement resend verification API call
      // await authService.resendVerification(formData.email);
      toast.success("Verification email sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send verification email");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      // TODO: Implement change password API call
      // await authService.changePassword(passwordData);
      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal account details securely.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <form onSubmit={handleSaveChanges} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                className="pl-10"
                value={formData.email}
                disabled
              />
            </div>
          </div>

          {/* Email verification warning */}
          {!isVerified && (
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Email not verified</p>
                  <p className="text-xs text-amber-600">
                    Verify to receive tickets and event reminders by email.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-[#1a5c2a] hover:bg-[#144a22]"
                onClick={handleSendVerification}
              >
                Send Verification Email
              </Button>
            </div>
          )}

          {/* Password section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Password</label>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Change Password</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${showPasswordForm ? "rotate-90" : ""}`} />
            </button>

            {showPasswordForm && (
              <div className="mt-4 space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isChangingPassword}
                  onClick={handleChangePassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-[#1a5c2a] hover:bg-[#144a22]"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setFormData({
              firstName: user?.name?.split(" ")[0] || "",
              lastName: user?.name?.split(" ").slice(1).join(" ") || "",
              email: user?.email || "",
            })}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
