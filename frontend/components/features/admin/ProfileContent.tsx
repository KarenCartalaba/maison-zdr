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
import { User, Mail, Shield, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
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
      toast.success("Profile updated successfully");
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof ProfileValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || "Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your admin profile</p>
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
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-24 w-24 rounded-full bg-muted overflow-hidden mb-4 group cursor-pointer"
              >
                <img
                  src={previewUrl || user?.profilePic || "/images/profile-placeholder.jpg"}
                  alt={user?.name || "Admin"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
              <h2 className="text-lg font-bold">{user?.name || "Aurel Baz"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email || "aurel@maisonzdr.com"}</p>
              <Badge className="mt-2 bg-[#1a5c2a]">Administrator</Badge>
              <p className="text-xs text-muted-foreground mt-4">Joined Jan 15, 2025</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Edit Profile</CardTitle>
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
                        <FieldLabel htmlFor="admin-firstName">First Name</FieldLabel>
                        <Input {...field} id="admin-firstName" aria-invalid={fieldState.invalid} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="admin-lastName">Last Name</FieldLabel>
                        <Input {...field} id="admin-lastName" aria-invalid={fieldState.invalid} />
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
                      <FieldLabel htmlFor="admin-email">Email</FieldLabel>
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
                      <FieldLabel htmlFor="admin-phone">Phone</FieldLabel>
                      <Input {...field} id="admin-phone" type="tel" placeholder="+33 6 12 34 56 78" aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button type="submit" className="bg-[#1a5c2a] hover:bg-[#144a22]" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Change Password</Button>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Verification</p>
                  <p className="text-xs text-muted-foreground">Your email is verified</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[#1a5c2a] border-[#1a5c2a]">Verified</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
