"use client";

import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();
  const features = t.home.about.features;

  return (
    <section className="bg-[#1a5c2a] text-white py-16">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t.home.about.title}
            </h2>
            <p className="text-white/80">
              {t.home.about.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#4ade80] mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-white/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          {/* TODO: Replace with actual venue/event photo */}
          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-white/10">
            <img
              src="/images/about.jpg"
              alt="People enjoying event"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
