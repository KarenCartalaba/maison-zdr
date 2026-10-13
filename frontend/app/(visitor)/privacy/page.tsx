import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Maison ZDR (Zone de Rassemblement) collects, uses, and protects your personal information when you register for events.",
};

export default function PrivacyPage() {
  return (
    <div className="container px-4 py-12">
      <div className="max-w-3xl mx-auto prose-headings:mb-4 prose-p:mb-4">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">
          Last updated: October 2026
        </p>

        <p className="mt-6">
          Maison ZDR (Zone de Rassemblement) operates an event registration
          platform for our community venue. This page explains what information
          we collect when you use this site, why we collect it, and the choices
          you have. We keep this plain and honest — if anything is unclear,
          contact us at{" "}
          <a href="mailto:hello@maisonzdr.com" className="text-[#1a5c2a] hover:underline">
            hello@maisonzdr.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. What we collect</h2>
        <p>
          When you create an account and register for events, we collect the
          details you provide: your full name, email address, and — if you bring
          guests — the names of those guests. When you write a review or contact
          us, we keep that message as well.
        </p>
        <p>
          We also store basic technical information such as your browser type
          and the pages you visit, which helps us keep the site running
          reliably. We do not use this to build advertising profiles.
        </p>

        <h2 className="text-2xl font-semibold mt-8">2. How we use it</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To create and secure your account, including email verification.</li>
          <li>To confirm your event registrations and manage guest capacity.</li>
          <li>To send registration confirmations and event reminders by email.</li>
          <li>To display reviews you choose to publish, alongside organizer replies.</li>
          <li>To respond to messages you send us.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">3. Who can see it</h2>
        <p>
          Event organizers can see the name, email, and guest count of people who
          register for their events so they can run the event and manage check-in.
          We do not sell your personal information, and we do not share it with
          third parties for marketing.
        </p>

        <h2 className="text-2xl font-semibold mt-8">4. Email &amp; reminders</h2>
        <p>
          We send transactional email only — registration confirmations, event
          reminders, verification links, and password resets. You can contact us
          at any time to stop non-essential messages.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. How long we keep it</h2>
        <p>
          We keep your account for as long as it is active. If you would like
          your account and associated registrations removed, email us and we will
          delete them, except where we must retain records for a registration
          that is still ongoing.
        </p>

        <h2 className="text-2xl font-semibold mt-8">6. Your rights</h2>
        <p>
          You can review and update your name and details from your account
          settings at any time. You may also request a copy of the data we hold
          about you, or ask us to correct or delete it, by contacting us.
        </p>

        <h2 className="text-2xl font-semibold mt-8">7. Contact</h2>
        <p>
          Questions about this policy or your data? Reach us at{" "}
          <a href="mailto:hello@maisonzdr.com" className="text-[#1a5c2a] hover:underline">
            hello@maisonzdr.com
          </a>
          , call{" "}
          <a href="tel:+3225550184" className="text-[#1a5c2a] hover:underline">
            +32 2 555 0184
          </a>
          , or visit us at 9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes.
        </p>
      </div>
    </div>
  );
}
