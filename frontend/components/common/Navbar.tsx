"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, LayoutDashboard, Menu, X, MailWarning, User, Check } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/common/Logo";
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

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isVerified, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const active = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container px-4 flex h-16 items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:ms-25 md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            {t.nav.home}
          </Link>
          <Link href="/events" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            {t.nav.events}
          </Link>
          <Link href="/news" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            {t.nav.news}
          </Link>
          <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            {t.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Selector (per-browser only) */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden md:flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground outline-none"
              aria-label={t.nav.language}
            >
              <span className="text-base">{active.flag}</span>
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
                  <span className="uppercase text-xs">{t.nav[l.labelKey]}</span>
                  {locale === l.value && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {/* Visitor (Not Logged In) */}
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-full px-6">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="rounded-full px-6 bg-[#1a5c2a] hover:bg-[#144a22]">
                    {t.nav.signup}
                  </Button>
                </Link>
              </>
            )}

            {/* Logged In Users (Unverified + Verified) */}
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t.nav.admin}
                    </Button>
                  </Link>
                )}

                {/* Notification Bell */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>

                {/* User Avatar */}
                <Link href="/profile">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                    <img
                      src={user?.profilePic || "/images/profile-placeholder.jpg"}
                      alt={user?.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>

                {/* Logout Button */}
                <Button
                  size="sm"
                  className="rounded-full px-6 bg-[#1a5c2a] hover:bg-[#144a22]"
                  onClick={() => logout()}
                >
                  {t.nav.logout}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.home}</Link>
              <Link href="/events" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.events}</Link>
              <Link href="/news" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.news}</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>{t.nav.contact}</Link>
            </nav>
            <div className="flex gap-2">
              <button
                onClick={() => setLocale("en")}
                className={`flex-1 rounded-full border px-4 py-2 text-sm ${locale === "en" ? "bg-[#1a5c2a] text-white border-[#1a5c2a]" : "text-foreground/80"}`}
              >
                🇺🇸 {t.nav.english}
              </button>
              <button
                onClick={() => setLocale("fr")}
                className={`flex-1 rounded-full border px-4 py-2 text-sm ${locale === "fr" ? "bg-[#1a5c2a] text-white border-[#1a5c2a]" : "text-foreground/80"}`}
              >
                🇫🇷 {t.nav.french}
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              {!isAuthenticated && (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">{t.nav.login}</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">{t.nav.signup}</Button>
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">{t.nav.profile}</Button>
                  </Link>
                  {isVerified && (
                    <Link href="/my-registrations" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">{t.nav.myRegistrations}</Button>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">{t.nav.adminDashboard}</Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    {t.nav.logout}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
