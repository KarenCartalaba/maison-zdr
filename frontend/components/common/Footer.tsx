"use client";

import Link from "next/link";
import Logo from "@/components/common/Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#1a5c2a] text-white">
      {/* Top divider band — flush with the footer's top edge, full width.
          Needed because the homepage About section directly above is the SAME
          green, so a divider drawn only inside the footer would be invisible.
          Keep AboutSection's bottom padding equal to the top padding below
          (pb-12 / py-12) so the band reads as the boundary between the two
          blocks, not as a stripe floating in a long stretch of green. */}
      <div className="h-1.5 w-full bg-white" aria-hidden="true" />

      <div className="container px-4 py-12">
        {/* Stacked on mobile the columns read as separate groups, so give them
            more row gap than the 32px used between columns on desktop. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Logo onDark />
            <p className="text-sm text-white/80">
              {t.footer.description}
            </p>
          </div>

          {/* Navigations */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.navigations}</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link
                  href="/"
                  className="hover:text-white"
                  onClick={(e) => {
                    // Force a full reload so Home always refreshes the page,
                    // even when already on the homepage (Next Link would no-op).
                    e.preventDefault();
                    window.location.assign("/");
                  }}
                >
                  {t.footer.home}
                </Link>
              </li>
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
            </ul>
            {/* Contact details as their own group, so the gap that splits the
                street address from the email is a set 16px rather than an
                extra nudge bolted onto one list item. */}
            <ul className="mt-4 space-y-1 text-sm text-white/80">
              <li>hello@maisonzdr.com</li>
              <li>+32 2 555 0184</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright — no rule above it, the py-6 gap is the only separation.
          text-white/70 rather than /60 so this small text clears the 4.5:1
          contrast minimum against the dark green. */}
      <div className="container px-4 py-6 text-center text-sm text-white/70">
        {t.footer.copyright}
      </div>
    </footer>
  );
}
