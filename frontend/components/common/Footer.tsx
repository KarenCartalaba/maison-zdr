"use client";

import Link from "next/link";
import Logo from "@/components/common/Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#1a5c2a] text-white">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo className="[&_div]:text-white [&_span]:text-white" />
            <p className="text-sm text-white/80">
              {t.footer.description}
            </p>
          </div>

          {/* Navigations */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.navigations}</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/" className="hover:text-white">{t.footer.home}</Link></li>
              <li><Link href="/events" className="hover:text-white">{t.footer.events}</Link></li>
              <li><Link href="/contact" className="hover:text-white">{t.footer.contacts}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.legal}</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/privacy" className="hover:text-white">{t.footer.privacyPolicy}</Link></li>
              <li><Link href="/terms" className="hover:text-white">{t.footer.termsConditions}</Link></li>
            </ul>
          </div>

          {/* Visit Us */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.visitUs}</h3>
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
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
