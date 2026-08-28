import ContactForm from "@/components/features/contact/ContactForm";
import ContactInfoCard from "@/components/features/contact/ContactInfoCard";
import FindUsCard from "@/components/features/contact/FindUsCard";

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">
          Send a Message ✈
        </h1>
        <p className="text-muted-foreground mt-2">
          We&apos;d love to hear from! Send us a message and we&apos;ll get back to you soon.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <ContactForm />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContactInfoCard />
          <FindUsCard />
        </div>
      </div>
    </div>
  );
}
