"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailContent() {
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
    <>
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
            <h2 className="text-xl font-bold">Verifying Email...</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your email
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-xl font-bold">Email Verified!</h2>
            <p className="text-sm text-muted-foreground">
              Your email has been successfully verified
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/login">
          <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">Go to Login</Button>
        </Link>
      </div>
    </>
  );
}
