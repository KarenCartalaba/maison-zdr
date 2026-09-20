"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import { Bell, Search, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALES: { value: Locale; flag: string; labelKey: "english" | "french" }[] = [
  { value: "en", flag: "🇺🇸", labelKey: "english" },
  { value: "fr", flag: "🇫🇷", labelKey: "french" },
];

export default function AdminHeader() {
  const { user } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const active = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  return (
    <header className="sticky top-0 z-40 border-b bg-white px-8 py-3">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 w-80">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t.header.searchPlaceholder}
            className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
          />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Language Selector (per-browser only — stored in localStorage) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground outline-none"
              aria-label={t.header.language}
            >
              <span className="text-base">{active.flag}</span>
              <span className="font-medium uppercase">{t.header[active.labelKey]}</span>
              <span className="text-xs">▾</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.value}
                  onClick={() => setLocale(l.value)}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="uppercase">{t.header[l.labelKey]}</span>
                  {locale === l.value && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#1a5c2a] border-2 border-white" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-wide">{user?.name || "AUREL BAZ"}</p>
              <p className="text-xs text-muted-foreground uppercase">{t.header.administrator}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
              <img
                src={user?.profilePic || "/images/profile-placeholder.jpg"}
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
