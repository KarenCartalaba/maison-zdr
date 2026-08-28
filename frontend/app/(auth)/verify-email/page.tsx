"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        if (response.code === 200) {
          setStatus("success");
          setMessage(response.message);
        } else {
          setStatus("error");
          setMessage(response.message);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
            <CardTitle className="mt-4">Verifying Email...</CardTitle>
            <CardDescription>Please wait while we verify your email</CardDescription>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="mt-4">Email Verified!</CardTitle>
            <CardDescription>Your email has been successfully verified</CardDescription>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="mt-4">Verification Failed</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardFooter className="flex justify-center">
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
