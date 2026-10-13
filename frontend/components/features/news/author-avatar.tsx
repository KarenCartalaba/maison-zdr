import { cn } from "@/lib/utils";

/**
 * Initials chip used in the bylines of the news list and detail pages.
 * Kept in the news feature so both views render an identical avatar.
 */
export function initialsOf(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function AuthorAvatar({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a5c2a]/10 text-[11px] font-bold text-[#1a5c2a] ring-1 ring-[#1a5c2a]/15",
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
