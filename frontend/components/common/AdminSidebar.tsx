"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ROUTES } from "@/constants";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  QrCode,
  Star,
  Users,
  BarChart3,
  Settings,
  User,
  LogOut,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allSidebarLinks = [
  { labelKey: "dashboard", href: ROUTES.ADMIN, icon: LayoutDashboard, adminOnly: false },
  { labelKey: "events", href: ROUTES.ADMIN_EVENTS, icon: Calendar, adminOnly: false },
  { labelKey: "news", href: ROUTES.ADMIN_NEWS, icon: Newspaper, adminOnly: true },
  { labelKey: "registrations", href: ROUTES.ADMIN_REGISTRATIONS, icon: ClipboardList, adminOnly: false },
  { labelKey: "checkins", href: ROUTES.ADMIN_CHECKINS, icon: QrCode, adminOnly: false },
  { labelKey: "reviews", href: ROUTES.ADMIN_REVIEWS, icon: Star, adminOnly: false },
  { labelKey: "users", href: ROUTES.ADMIN_USERS, icon: Users, adminOnly: true },
  { labelKey: "analytics", href: ROUTES.ADMIN_ANALYTICS, icon: BarChart3, adminOnly: true },
  { labelKey: "settings", href: ROUTES.ADMIN_SETTINGS, icon: Settings, adminOnly: true },
  { labelKey: "profile", href: ROUTES.ADMIN_PROFILE, icon: User, adminOnly: false },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  const sidebarLinks = allSidebarLinks.filter(
    (link) => isAdmin || !link.adminOnly
  );

  return (
    <aside className="w-64 bg-[#1a5c2a] text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6">
        <Link href={ROUTES.HOME} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-lg">
            Z
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">MAISON</p>
            <p className="text-xs text-white/70">ZDR</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== ROUTES.ADMIN && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {t.sidebar[link.labelKey]}
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-white/20 overflow-hidden shrink-0 flex items-center justify-center">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user?.name || "Admin"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-white/80" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-white/60">{user?.role === "ADMIN" ? t.sidebar.generalManager : t.sidebar.moderator}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-white/60 hover:text-white transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
