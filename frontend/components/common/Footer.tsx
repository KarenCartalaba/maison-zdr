import Link from "next/link";
import { ROUTES } from "@/constants";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href={ROUTES.HOME} className="font-bold text-lg">
              Zone de Rassemblement
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Your centralized platform for event registration and management.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={ROUTES.HOME} className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href={ROUTES.EVENTS} className="hover:text-foreground">
                  Events
                </Link>
              </li>
              <li>
                <Link href={ROUTES.GALLERY} className="hover:text-foreground">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={ROUTES.LOGIN} className="hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SIGNUP} className="hover:text-foreground">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={ROUTES.CONTACT} className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Zone de Rassemblement. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
