"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, CalendarDays, Menu, X, MailWarning } from "lucide-react";
import { useState } from "react";
import Logo from "@/components/common/Logo";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isVerified, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container px-4 flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            Home
          </Link>
          <Link href="/events" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            Events
          </Link>
          <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-foreground">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {/* Visitor (Not Logged In) */}
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-full px-6">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="rounded-full px-6 bg-[#1a5c2a] hover:bg-[#144a22]">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Unverified User */}
            {isAuthenticated && !isVerified && (
              <>
                <Link href="/verify-email">
                  <Button variant="outline" size="sm" className="text-amber-600 border-amber-600 hover:bg-amber-50">
                    <MailWarning className="h-4 w-4 mr-2" />
                    Verify Email
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Verified User */}
            {isAuthenticated && isVerified && (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/my-registrations" />}>
                      <CalendarDays className="h-4 w-4 mr-2" />
                      My Registrations
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="/events" onClick={() => setIsMobileMenuOpen(false)}>Events</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            </nav>
            <div className="flex flex-col space-y-2">
              {!isAuthenticated && (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">Sign Up</Button>
                  </Link>
                </>
              )}
              {isAuthenticated && !isVerified && (
                <>
                  <Link href="/verify-email" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-amber-600 border-amber-600">Verify Email</Button>
                  </Link>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Profile</Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    Logout
                  </Button>
                </>
              )}
              {isAuthenticated && isVerified && (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Profile</Button>
                  </Link>
                  <Link href="/my-registrations" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">My Registrations</Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Admin Dashboard</Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    Logout
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
