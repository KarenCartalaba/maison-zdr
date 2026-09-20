"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function EventHeroBanner() {
  const { t } = useLanguage();
  return (
    <section className="relative h-[300px] md:h-[400px]">
      {/* TODO: Replace with actual venue exterior image */}
      <img
        src="/images/events-hero.jpg"
        alt="Zone de Rassemblement venue"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center">
        <div className="container px-4 text-white space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold max-w-lg">
            {t.events.heroTitle}
          </h1>
          <p className="text-lg text-white/90 max-w-md">
            {t.events.heroSubtitle}
          </p>
          <Button className="bg-white text-foreground hover:bg-white/90 rounded-full px-8">
            {t.events.viewEvents}
          </Button>
        </div>
      </div>
    </section>
  );
}
