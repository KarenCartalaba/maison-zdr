"use client";

import { Button } from "@/components/ui/button";

const CATEGORIES = ["All Events", "Food", "Arts", "Games", "Music", "Performance"];

interface EventFiltersProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function EventFilters({ selected, onSelect }: EventFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          size="sm"
          className={`rounded-full ${
            selected === category
              ? "bg-[#1a5c2a] hover:bg-[#144a22]"
              : ""
          }`}
          onClick={() => onSelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
