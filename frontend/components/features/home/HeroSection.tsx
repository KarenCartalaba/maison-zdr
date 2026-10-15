"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="container px-4 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-6">
          <p className="text-sm font-medium text-[#1a5c2a] uppercase tracking-wide">
            {t.home.hero.badge}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t.home.hero.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.home.hero.subtitle}
          </p>
          <div className="flex gap-4">
            <Link href="/events">
              <Button className="bg-[#1a5c2a] hover:bg-[#144a22] rounded-full px-8">
                {t.home.hero.browseEvents}
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-8"
              onClick={scrollToHowItWorks}
            >
              {t.home.hero.learnMore}
            </Button>
          </div>
        </div>

        {/* Image Collage */}
        <div className="mx-auto grid w-full max-w-[520px] grid-cols-2 items-center gap-4 md:gap-5">
          <div className="group aspect-[2/3] overflow-hidden rounded-2xl bg-muted">
            <img
              src="/images/home1.jpg"
              alt="Bar interior"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          </div>

          <div className="grid gap-4 md:gap-5">
            <div className="group aspect-square overflow-hidden rounded-2xl bg-muted">
              <img
                src="/images/home2.jpg"
                alt="Dart board"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="group aspect-[11/10] overflow-hidden rounded-2xl bg-muted">
              <img
                src="/images/home3.jpg"
                alt="Venue exterior"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
