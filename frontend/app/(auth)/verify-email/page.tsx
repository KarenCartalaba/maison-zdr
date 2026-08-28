import { Suspense } from "react";
import AuthLayout from "@/components/common/AuthLayout";
import VerifyEmailContent from "@/components/features/auth/VerifyEmailContent";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
