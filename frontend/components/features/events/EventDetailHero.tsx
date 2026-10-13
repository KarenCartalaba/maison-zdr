"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EventImage from "@/components/ui/event-image";
import { useLanguage } from "@/context/LanguageContext";

interface EventDetailHeroProps {
  title: string;
  imageUrl?: string;
}

export default function EventDetailHero({ title, imageUrl }: EventDetailHeroProps) {
  const { t } = useLanguage();
  return (
    <div className="container px-4 pt-6 md:pt-8">
      {/* Back link sits at the very top of the detail page, above the hero image */}
      <Link
        href="/events"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t.events.back}
      </Link>

      <section className="relative h-[300px] md:h-[400px] overflow-hidden rounded-2xl">
        <EventImage src={imageUrl} title={title} className="h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        </div>
      </section>
    </div>
  );
}
