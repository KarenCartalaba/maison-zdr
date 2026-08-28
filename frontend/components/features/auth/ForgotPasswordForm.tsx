"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const handleSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      if (error.errors?.length) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof ForgotPasswordValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || "Failed to send reset link");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-[#1a5c2a] mx-auto" />
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists with that email, you&apos;ll receive a password reset link shortly.
        </p>
        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" className="w-full bg-[#1a5c2a] hover:bg-[#144a22]" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
          ) : (
            "Send Reset Link"
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
