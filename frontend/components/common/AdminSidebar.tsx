"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ImageIcon,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    label: "Dashboard",
    href: ROUTES.ADMIN,
    icon: LayoutDashboard,
  },
  {
    label: "Events",
    href: ROUTES.ADMIN_EVENTS,
    icon: Calendar,
  },
  {
    label: "Users",
    href: ROUTES.ADMIN_USERS,
    icon: Users,
  },
  {
    label: "Gallery",
    href: ROUTES.ADMIN_GALLERY,
    icon: ImageIcon,
  },
  {
    label: "Settings",
    href: ROUTES.ADMIN_SETTINGS,
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 border-r bg-muted/30">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Link href={ROUTES.HOME} className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Link>
        </div>

        <div className="p-4">
          <h2 className="font-semibold">Admin Panel</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
