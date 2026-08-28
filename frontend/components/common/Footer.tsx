import Link from "next/link";
import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#1a5c2a] text-white">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo className="[&_div]:text-white [&_span]:text-white" />
            <p className="text-sm text-white/80">
              A Modern Event Registration website designed for seamless event experiences.
            </p>
          </div>

          {/* Navigations */}
          <div>
            <h3 className="font-semibold mb-4">Navigations</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contacts</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Visit Us */}
          <div>
            <h3 className="font-semibold mb-4">Visit Us</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>9 Rue du Commerce, 35140</li>
              <li>Saint-Hilaire-des-Landes</li>
              <li className="pt-2">hello@maisonzdr.com</li>
              <li>+32 2 555 0184</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20">
        <div className="container px-4 py-6 text-center text-sm text-white/60">
          &copy; 2026 Zone de Rassemblement. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
