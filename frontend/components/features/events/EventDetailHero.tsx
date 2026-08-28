import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EventDetailHeroProps {
  title: string;
  imageUrl?: string;
}

export default function EventDetailHero({ title, imageUrl }: EventDetailHeroProps) {
  return (
    <section className="relative h-[300px] md:h-[400px]">
      {/* TODO: Replace with actual event image from imageUrl prop */}
      <img
        src={imageUrl || "/images/event-default.jpg"}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 p-8">
        <Link
          href="/events"
          className="inline-flex items-center text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
      </div>
    </section>
  );
}
