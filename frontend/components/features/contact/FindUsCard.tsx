"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

export default function FindUsCard() {
  const { t } = useLanguage();
  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle>{t.contact.findUs}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Replace with actual Google Maps embed or interactive map */}
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src="/images/map.png"
            alt="Map showing our location"
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}
