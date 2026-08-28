import Link from "next/link";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {/* TODO: Replace with actual logo image */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a] text-white font-bold text-lg">
        M
      </div>
      <div className="leading-tight">
        <div className="font-semibold text-sm">Maison</div>
        <div className="font-semibold text-sm">ZDR</div>
      </div>
    </Link>
  );
}
