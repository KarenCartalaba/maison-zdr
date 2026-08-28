"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function MyReviewsTab() {
  // TODO: Fetch user's reviews from API
  const reviews: never[] = [];

  if (reviews.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Reviews</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your event reviews and ratings.
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events joined yet</h3>
          <p className="text-muted-foreground max-w-md">
            You haven&apos;t registered for any events. Explore what&apos;s happening in Zone de Rassemblement
          </p>
          <Link href="/events" className="mt-6">
            <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Reviews</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your event reviews and ratings.
        </p>
      </div>

      {/* TODO: Render ReviewCard list when reviews are loaded */}
      <div className="space-y-4">
        {/* Reviews will be rendered here */}
      </div>
    </div>
  );
}
