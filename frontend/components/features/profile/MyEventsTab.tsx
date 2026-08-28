"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, Grid, List } from "lucide-react";

const FILTERS = ["All", "Upcoming", "Attended", "Cancelled"];

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Cocktail Night",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    imageUrl: "/images/event-2.jpg",
  },
  {
    id: "2",
    title: "Acoustic Friday",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    imageUrl: "/images/event-1.jpg",
  },
  {
    id: "3",
    title: "Trivia Hour",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    imageUrl: "/images/event-3.jpg",
  },
  {
    id: "4",
    title: "Food Night",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    imageUrl: "/images/event-4.jpg",
  },
  {
    id: "5",
    title: "Game Day",
    date: "Wednesday 7:00 pm - 10:00pm",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    imageUrl: "/images/event-5.jpg",
  },
];

export default function MyEventsTab() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">My Events</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track your registration, attendance, and event history.
        </p>
      </div>

      {/* Filter tabs + View toggle */}
      <div className="flex items-center justify-between mb-8 border-b">
        <div className="flex gap-4">
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
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="flex items-center gap-4 rounded-lg border p-4 hover:shadow-sm transition-shadow">
            <div className="h-20 w-28 rounded-lg overflow-hidden bg-muted shrink-0">
              <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {event.date}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
            </div>
            <Link href={`/events/${event.id}`}>
              <Button variant="outline" size="sm">
                View Details →
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
