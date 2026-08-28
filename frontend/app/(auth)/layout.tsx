import Navbar from "@/components/common/Navbar";
import { AuthGuard } from "@/components/features/auth/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard mode="GUEST">
      <Navbar/>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md px-4">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
