"use client";

import { UserPlus, Search, ClipboardCheck, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = [UserPlus, Search, ClipboardCheck, Star];

export default function HowItWorksSection() {
  const { t } = useLanguage();
  const steps = t.home.howItWorks.steps;

  return (
    <section className="container px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">{t.home.howItWorks.title}</h2>
        <p className="text-muted-foreground mt-2">
          {t.home.howItWorks.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, idx) => {
          const Icon = ICONS[idx];
          return (
            <div key={step.number} className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 rounded-xl border p-4">
                <span className="text-lg font-bold text-[#1a5c2a]">{step.number}</span>
                <Icon className="h-5 w-5 text-[#1a5c2a]" />
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
