import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="container py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-6">
          <p className="text-sm font-medium text-[#1a5c2a] uppercase tracking-wide">
            Zone de Rassemblement
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Register Now and Experience the Ultimate Bar Vibe
          </h1>
          <p className="text-muted-foreground text-lg">
            Relax, unwind, and soak in the atmosphere. Every table brings laughter, music, and good times.
          </p>
          <div className="flex gap-4">
            <Link href="/events">
              <Button className="bg-[#1a5c2a] hover:bg-[#144a22] rounded-full px-8">
                Browse Events
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="rounded-full px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Image Collage */}
        <div className="relative h-[400px] md:h-[500px]">
          {/* TODO: Replace placeholder images with actual bar/venue photos */}
          <div className="absolute top-0 left-0 w-[60%] h-[65%] rounded-2xl overflow-hidden bg-muted">
            <img
              src="/images/hero-1.jpg"
              alt="Bar interior"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[35%] h-[45%] rounded-2xl overflow-hidden bg-muted">
            <img
              src="/images/hero-2.jpg"
              alt="Dart board"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-[45%] h-[50%] rounded-2xl overflow-hidden bg-muted">
            <img
              src="/images/hero-3.jpg"
              alt="Venue exterior"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
