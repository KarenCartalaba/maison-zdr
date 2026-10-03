"use client";

import { useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { User, Mail, Shield, Loader2, Camera, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import { toast } from "sonner";
import { isValidImageFile } from "@/lib/utils";
import { downscaleImage } from "@/lib/image";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name must be at most 100 characters"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

// Same shape as SettingsTab's passwordSchema so client validation matches the
// backend changePasswordSchema (no server-side rejection after client passes).
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one number")
    .regex(/[\W_]/, "Must contain one special character"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, dateLocale } = useLanguage();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      phone: "",
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

  const handleChangePassword = async (data: PasswordValues) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      toast.success(t.profile.passwordChangedSuccessfully);
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.adminProfile.updateError);
      return;
    }

    if (!isValidImageFile(file)) {
      toast.error("Invalid image format. Accepted formats: JPEG, PNG, WebP, GIF");
      return;
    }

    try {
      // Downscale client-side (<1MB) so the save rides the same-origin /api
      // proxy with first-party cookies (no absolute-URL bypass → no 401).
      const downscaled = await downscaleImage(file);
      setImageBase64(downscaled);
      setPreviewUrl(downscaled);
    } catch {
      toast.error(t.adminProfile.updateError);
    }
  };

  const handleSave = async (data: ProfileValues) => {
    setIsSaving(true);
    try {
      const response = await authService.updateProfile({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        imageBase64: imageBase64 || undefined,
      });
      if (response.code === 200 && response.data?.user) {
        updateUser(response.data.user);
      }
      toast.success(t.adminProfile.updateSuccess);
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof ProfileValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || t.adminProfile.updateError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminProfile.title}</h1>
          <p className="text-sm text-muted-foreground">{t.adminProfile.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-24 w-24 rounded-full bg-muted overflow-hidden mb-4 group cursor-pointer flex items-center justify-center"
              >
                {(previewUrl || user?.profilePic) ? (
                  <img
                    src={previewUrl || user?.profilePic || ""}
                    alt={user?.name || "Admin"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
              <h2 className="text-lg font-bold">{user?.name || "Aurel Baz"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || "aurel@maisonzdr.com"}</p>
              <Badge className="mt-2 bg-[#1a5c2a]">{t.adminProfile.administrator}</Badge>
              {user?.createdAt && (
                <p className="text-xs text-muted-foreground mt-4">
                  {t.adminProfile.joinedDate} {formatDate(user.createdAt, dateLocale)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t.adminProfile.editProfile}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4" noValidate>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="admin-firstName">{t.adminProfile.labelFirstName}</FieldLabel>
                        <Input {...field} id="admin-firstName" maxLength={100} aria-invalid={fieldState.invalid} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="admin-lastName">{t.adminProfile.labelLastName}</FieldLabel>
                        <Input {...field} id="admin-lastName" maxLength={100} aria-invalid={fieldState.invalid} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="admin-email">{t.adminProfile.labelEmail}</FieldLabel>
                      <Input {...field} id="admin-email" type="email" disabled aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="admin-phone">{t.adminProfile.labelPhone}</FieldLabel>
                      <Input {...field} id="admin-phone" type="tel" placeholder="+33 6 12 34 56 78" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button type="submit" className="bg-[#1a5c2a] hover:bg-[#144a22]" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.adminProfile.saving}</>
                ) : (
                  t.adminProfile.saveChanges
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{t.adminProfile.security}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t.adminProfile.password}</p>
                  <p className="text-xs text-muted-foreground">{t.adminProfile.passwordChanged}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm((v) => !v)}
              >
                {t.adminProfile.changePassword}
              </Button>
            </div>
            {showPasswordForm && (
              <form
                onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                className="rounded-lg border p-4 space-y-4"
                noValidate
              >
                <FieldGroup>
                  <Controller
                    name="currentPassword"
                    control={passwordForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="admin-currentPassword">{t.profile.currentPassword}</FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id="admin-currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="••••••••"
                            aria-invalid={fieldState.invalid}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword((v) => !v)}
                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                            aria-pressed={showCurrentPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="newPassword"
                    control={passwordForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="admin-newPassword">{t.profile.newPassword}</FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id="admin-newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="••••••••"
                            aria-invalid={fieldState.invalid}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((v) => !v)}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                            aria-pressed={showNewPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={passwordForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="admin-confirmPassword">{t.profile.confirmPassword}</FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id="admin-confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            aria-invalid={fieldState.invalid}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            aria-pressed={showConfirmPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1a5c2a] hover:bg-[#144a22]"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.profile.changing}
                      </>
                    ) : (
                      t.profile.updatePassword
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      passwordForm.reset();
                      setShowPasswordForm(false);
                    }}
                  >
                    {t.profile.back}
                  </Button>
                </div>
              </form>
            )}
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t.adminProfile.emailVerification}</p>
                  <p className="text-xs text-muted-foreground">{t.adminProfile.emailVerified}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[#1a5c2a] border-[#1a5c2a]">{t.adminProfile.verified}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
