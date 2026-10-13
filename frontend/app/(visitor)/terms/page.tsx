import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The terms that apply when you register for and attend events at Maison ZDR (Zone de Rassemblement).",
};

export default function TermsPage() {
  return (
    <div className="container px-4 py-12">
      <div className="max-w-3xl mx-auto prose-headings:mb-4 prose-p:mb-4">
        <h1 className="text-4xl font-bold">Terms and Conditions</h1>
        <p className="text-muted-foreground mt-2">
          Last updated: October 2026
        </p>

        <p className="mt-6">
          These terms apply when you create an account and register for events
          hosted at Maison ZDR (Zone de Rassemblement). By registering, you agree
          to them. If you have questions, contact{" "}
          <a href="mailto:hello@maisonzdr.com" className="text-[#1a5c2a] hover:underline">
            hello@maisonzdr.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8">1. Accounts</h2>
        <p>
          You need an account to register for events. Provide accurate details and
          keep your login secure — you are responsible for activity on your
          account. One account per person; registrations are personal and cannot
          be transferred to someone else.
        </p>

        <h2 className="text-2xl font-semibold mt-8">2. Registrations &amp; guests</h2>
        <p>
          Each registration reserves your spot, and you may bring up to 2 guests
          where the event allows it. Guests count toward the event&apos;s maximum
          capacity, so their names must be provided at registration. Registrations
          are confirmed once you receive a confirmation email.
        </p>

        <h2 className="text-2xl font-semibold mt-8">3. Cancellations</h2>
        <p>
          You may cancel your registration at any time before the event&apos;s
          registration deadline from your account. Cancellations made after the
          deadline may not be processed. If an event is cancelled or rescheduled by
          the organizer, we will notify you by email.
        </p>

        <h2 className="text-2xl font-semibold mt-8">4. Attendance &amp; conduct</h2>
        <p>
          Bring your confirmation to check in at the venue. We ask that guests
          treat staff and other attendees respectfully. We may refuse entry or
          remove anyone whose behavior disrupts the event or other guests, and
          reserve the right to cancel a registration in such cases.
        </p>

        <h2 className="text-2xl font-semibold mt-8">5. Reviews</h2>
        <p>
          After attending, you can leave a review. Reviews you publish are visible
          to other visitors, and organizers may reply. Keep reviews honest and
          relevant; we may remove content that is abusive, spam, or unrelated to
          the event.
        </p>

        <h2 className="text-2xl font-semibold mt-8">6. Photography at events</h2>
        <p>
          Events at the venue may be photographed or recorded for promotional use.
          By attending, you consent to being included in such photos or footage.
          If you prefer not to appear, let an organizer know at the event.
        </p>

        <h2 className="text-2xl font-semibold mt-8">7. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. The latest version is
          always posted on this page, and continued use of the platform after a
          change means you accept the updated terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8">8. Contact</h2>
        <p>
          For anything about these terms, reach us at{" "}
          <a href="mailto:hello@maisonzdr.com" className="text-[#1a5c2a] hover:underline">
            hello@maisonzdr.com
          </a>
          , call{" "}
          <a href="tel:+3225550184" className="text-[#1a5c2a] hover:underline">
            +32 2 555 0184
          </a>
          , or visit 9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes.
        </p>
      </div>
    </div>
  );
}
