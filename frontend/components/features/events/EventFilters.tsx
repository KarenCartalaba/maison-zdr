"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface EventFiltersProps {
  selected: string;
  onSelect: (category: string) => void;
}

export default function EventFilters({ selected, onSelect }: EventFiltersProps) {
  const { t } = useLanguage();
  const CATEGORIES = [
    { key: t.events.allEvents, label: t.events.allEvents },
    { key: t.events.food, label: t.events.food },
    { key: t.events.arts, label: t.events.arts },
    { key: t.events.games, label: t.events.games },
    { key: t.events.music, label: t.events.music },
    { key: t.events.performance, label: t.events.performance },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Button
          key={category.key}
          variant={selected === category.key ? "default" : "outline"}
          size="sm"
          className={`rounded-full ${
            selected === category.key
              ? "bg-[#1a5c2a] hover:bg-[#144a22]"
              : ""
          }`}
          onClick={() => onSelect(category.key)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
