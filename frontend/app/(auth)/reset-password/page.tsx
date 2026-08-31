import { Suspense } from "react";
import AuthLayout from "@/components/common/AuthLayout";
import ResetPasswordForm from "@/components/features/auth/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
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
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
