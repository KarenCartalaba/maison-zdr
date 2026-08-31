"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[0-9]/, "Must contain one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"validating" | "form" | "success" | "error">(
    token ? "validating" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "No reset token provided. Please request a new password reset link."
  );

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        const response = await authService.validateResetToken(token);
        if (response.code === 200) {
          setStatus("form");
        } else {
          setStatus("error");
          setMessage(response.message);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Invalid or expired reset link");
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (data: ResetPasswordValues) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, data.password);
      if (response.code === 200) {
        setStatus("success");
        setMessage(response.message);
      } else {
        setStatus("error");
        setMessage(response.message);
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Failed to reset password");
      if (error.errors?.length) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof ResetPasswordValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "validating") {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
        <h2 className="text-xl font-bold">Validating reset link...</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we verify your reset token
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-[#1a5c2a] mx-auto" />
        <h1 className="text-2xl font-bold">Password Reset!</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to login
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center space-y-4">
        <XCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Reset Failed</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href="/forgot-password" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Set new password</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your new password below.</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        <FieldGroup>
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reset-password">New Password</FieldLabel>
                <Input
                  {...field}
                  id="reset-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reset-confirmPassword">Confirm Password</FieldLabel>
                <Input
                  {...field}
                  id="reset-confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" className="w-full bg-[#1a5c2a] hover:bg-[#144a22]" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</>
          ) : (
            "Reset Password"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-foreground hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </>
  );
}
