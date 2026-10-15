"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface GalleryGridProps {
  images?: string[];
}

// TODO: Replace placeholder images with actual event photos
const PLACEHOLDER_IMAGES = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
];

export default function GalleryGrid({ images }: GalleryGridProps) {
  const { t } = useLanguage();
  const displayImages = images || PLACEHOLDER_IMAGES;
  const total = displayImages.length;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setActiveIndex(0);
  }, []);

  const navigateLightbox = useCallback(
    (direction: "prev" | "next") => {
      setActiveIndex((current) =>
        direction === "next"
          ? (current + 1) % total
          : (current - 1 + total) % total
      );
    },
    [total]
  );

  // Keyboard navigation + scroll lock while the lightbox is open
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (total < 2) return;
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "ArrowLeft") navigateLightbox("prev");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, total, closeLightbox, navigateLightbox]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t.events.eventHighlights}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayImages.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => openLightbox(index)}
            aria-label={`${t.events.eventHighlights} ${index + 1}`}
            className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-[#1a5c2a] focus:ring-offset-2"
          >
            {/* TODO: Replace with actual event gallery images */}
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover affordance — expands the photo */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/35"
            >
              <Maximize2 className="h-6 w-6 -translate-y-1 text-white/0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:text-white/90" />
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.events.eventHighlights}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            aria-label={t.adminUsers.modalClose}
            className="absolute top-4 right-4 z-10 text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a]"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Section label + counter */}
          <div className="absolute top-4 left-4 z-10 text-white">
            <p className="font-semibold">{t.events.eventHighlights}</p>
            <p className="text-sm text-white/70">
              {activeIndex + 1} / {total}
            </p>
          </div>

          {/* Navigation */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
                aria-label={t.pagination.previous}
                className="absolute left-4 z-10 p-2 text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a]"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
                aria-label={t.pagination.next}
                className="absolute right-4 z-10 p-2 text-white/80 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a]"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={displayImages[activeIndex]}
            alt={`Gallery image ${activeIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}