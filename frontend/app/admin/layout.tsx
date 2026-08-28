import AdminSidebar from "@/components/common/AdminSidebar";
import AdminHeader from "@/components/common/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-8 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
