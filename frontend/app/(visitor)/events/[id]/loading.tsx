import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level skeleton for /events/[id]. Shown while the server component
 * awaits the event fetch, so navigating between events never blanks the page
 * or flashes the "Not Found" state. Mirrors EventDetailContent's loading
 * branch exactly.
 */
export default function EventDetailLoading() {
  return (
    <div>
      <div className="container px-4 pt-6 md:pt-8">
        <Skeleton className="h-[300px] md:h-[400px] w-full rounded-2xl" />
      </div>
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
