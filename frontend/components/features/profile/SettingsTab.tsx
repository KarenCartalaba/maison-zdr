"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Mail, Lock, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[0-9]/, "Must contain one number"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordValues = z.infer<typeof passwordSchema>;

export default function SettingsTab() {
  const { user, updateUser, isVerified } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
    },
    mode: "onBlur",
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const handleSaveChanges = async (data: ProfileValues) => {
    setIsUpdating(true);
    try {
      const response = await authService.updateProfile({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
      });
      if (response.code === 200 && response.data?.user) {
        updateUser(response.data.user);
      }
      toast.success("Profile updated successfully");
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof ProfileValues;
          if (fieldName in profileForm.getValues()) {
            profileForm.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || "Failed to update profile");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      await authService.forgotPassword(user?.email || "");
      toast.success("Verification email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    }
  };

  const handleChangePassword = async (data: PasswordValues) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success("Password changed successfully");
      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof PasswordValues;
          if (fieldName in passwordForm.getValues()) {
            passwordForm.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || "Failed to change password");
      }
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
        <form onSubmit={profileForm.handleSubmit(handleSaveChanges)} className="space-y-6" noValidate>
          <FieldGroup>
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="firstName"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-firstName">First Name</FieldLabel>
                    <Input {...field} id="settings-firstName" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="lastName"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="settings-lastName">Last Name</FieldLabel>
                    <Input {...field} id="settings-lastName" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Email */}
            <Controller
              name="email"
              control={profileForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="settings-email">Email</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      {...field}
                      id="settings-email"
                      type="email"
                      className="pl-10"
                      disabled
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

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
                <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} noValidate>
                  <FieldGroup>
                    <Controller
                      name="currentPassword"
                      control={passwordForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                          <Input
                            {...field}
                            id="currentPassword"
                            type="password"
                            placeholder="••••••••"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="newPassword"
                      control={passwordForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                          <Input
                            {...field}
                            id="newPassword"
                            type="password"
                            placeholder="••••••••"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="confirmPassword"
                      control={passwordForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                          <Input
                            {...field}
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                  <div className="mt-4">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={isChangingPassword}
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
                </form>
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
            <Button type="button" variant="outline" onClick={() => profileForm.reset()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
