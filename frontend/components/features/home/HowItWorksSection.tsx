import { UserPlus, Search, ClipboardCheck, Star } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description: "Sign up and verify your email to unlock event registration.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Browse Event",
    description: "Explore upcoming and ongoing events.",
    icon: Search,
  },
  {
    number: "03",
    title: "Register",
    description: "Fill your details and add up to 2 guests. Submit your registration.",
    icon: ClipboardCheck,
  },
  {
    number: "04",
    title: "Attend & Review",
    description: "Receive a confirmation, attend the event, and share your review.",
    icon: Star,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="container px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">How Registration Works</h2>
        <p className="text-muted-foreground mt-2">
          Four simple steps to secure your spot at any event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 rounded-xl border p-4">
              <span className="text-lg font-bold text-[#1a5c2a]">{step.number}</span>
              <step.icon className="h-5 w-5 text-[#1a5c2a]" />
            </div>
            <div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
