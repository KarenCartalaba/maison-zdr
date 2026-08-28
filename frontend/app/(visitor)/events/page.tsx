"use client";

import { useState } from "react";
import EventHeroBanner from "@/components/features/events/EventHeroBanner";
import EventFilters from "@/components/features/events/EventFilters";
import EventCard from "@/components/features/events/EventCard";
import type { Event } from "@/types";

// TODO: Replace with actual API call
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    slug: "acoustic-fridays",
    title: "Acoustic Fridays",
    description: "A night of live acoustic music and drinks.",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    eventDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(),
    minParticipants: 5,
    maxParticipants: 20,
    isCancelled: false,
    gallery: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "1",
    author: { id: "1", name: "Maison ZDR Events Team", email: "events@maisonzdr.com" },
    _count: { registrations: 8 },
  },
  {
    id: "2",
    slug: "cocktail-night",
    title: "Cocktail Night",
    description: "Enjoy handcrafted cocktails in a relaxed atmosphere.",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    eventDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(),
    minParticipants: 5,
    maxParticipants: 20,
    isCancelled: false,
    gallery: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "1",
    author: { id: "1", name: "Maison ZDR Events Team", email: "events@maisonzdr.com" },
    _count: { registrations: 8 },
  },
  {
    id: "3",
    slug: "trivia-hour",
    title: "Trivia Hour",
    description: "Test your knowledge with fun trivia questions.",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    eventDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(),
    minParticipants: 5,
    maxParticipants: 20,
    isCancelled: false,
    gallery: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "1",
    author: { id: "1", name: "Maison ZDR Events Team", email: "events@maisonzdr.com" },
    _count: { registrations: 8 },
  },
];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Events");

  return (
    <>
      <EventHeroBanner />
      <div className="container px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Events</h1>
        <EventFilters selected={selectedCategory} onSelect={setSelectedCategory} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {MOCK_EVENTS.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </>
  );
}
