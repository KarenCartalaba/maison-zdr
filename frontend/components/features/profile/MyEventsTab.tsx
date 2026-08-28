"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

const FILTERS = ["All", "Upcoming", "Attended", "Cancelled"];

export default function MyEventsTab() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  // TODO: Fetch user's registered events from API
  const events: never[] = [];

  if (events.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Events</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your registration, attendance, and event history.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-4 mb-8 border-b">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                selectedFilter === filter
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
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
        <h2 className="text-2xl font-bold">My Events</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track your registration, attendance, and event history.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              selectedFilter === filter
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* TODO: Render EventCard list when events are loaded */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Events will be rendered here */}
      </div>
    </div>
  );
}
