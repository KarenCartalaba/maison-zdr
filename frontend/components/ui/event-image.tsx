interface EventImageProps {
  src?: string | null;
  title?: string;
  alt?: string;
  className?: string;
  cacheKey?: string | number;
}

export default function EventImage({ src, title, alt, className, cacheKey }: EventImageProps) {
  const imageSrc = src ? (cacheKey ? `${src}?v=${cacheKey}` : src) : null;

  return (
    <div className={`relative overflow-hidden bg-muted ${className ?? ""}`}>
      {imageSrc ? (
        <img src={imageSrc} alt={alt || title || "Event"} className="h-full w-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#1a5c2a] to-[#2d8a4e] flex items-center justify-center">
          <span className="text-4xl font-bold text-white/80">
            {(title || "E").charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
