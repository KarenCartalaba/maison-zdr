"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Search, Globe } from "lucide-react";

export default function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span className="text-base">🇺🇸</span>
            <span className="font-medium">ENGLISH</span>
            <span className="text-xs">▾</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#1a5c2a] border-2 border-white" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-wide">{user?.name || "AUREL BAZ"}</p>
              <p className="text-xs text-muted-foreground">ADMINISTRATOR</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
              <img
                src="/images/profile-placeholder.jpg"
                alt={user?.name || "Admin"}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
