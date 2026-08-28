import { AuthGuard } from "@/components/features/auth/AuthGuard";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard mode="PRIVATE">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
