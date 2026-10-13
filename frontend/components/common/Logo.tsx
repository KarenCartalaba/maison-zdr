import Link from "next/link";

interface LogoProps {
  className?: string;
  /** Render the mark/text for dark backgrounds (e.g. the green footer):
   *  the "M" mark becomes white at reduced opacity so it blends in, while
   *  staying legible. On light backgrounds (navbar) the default green mark
   *  is kept so it does not disappear. */
  onDark?: boolean;
}

export default function Logo({ className, onDark = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {/* TODO: Replace with actual logo image */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg ${
          onDark ? "bg-white/15 text-white/80" : "bg-[#1a5c2a] text-white"
        }`}
      >
        M
      </div>
      <div className={`leading-tight ${onDark ? "text-white" : ""}`}>
        <div className="font-semibold text-sm">Maison</div>
        <div className="font-semibold text-sm">ZDR</div>
      </div>
    </Link>
  );
}
