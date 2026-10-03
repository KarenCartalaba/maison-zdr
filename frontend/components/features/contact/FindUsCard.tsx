"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";

export default function FindUsCard() {
  const { t } = useLanguage();
  // Keyless Google Maps embed for the venue address (9 Rue du Commerce,
  // 35140 Saint-Hilaire-des-Landes) — replaces the static map.png screenshot.
  const mapEmbedSrc =
    "https://www.google.com/maps?q=9+Rue+du+Commerce,+35140+Saint-Hilaire-des-Landes,+France&z=15&output=embed";
  const mapLink =
    "https://www.google.com/maps/search/?api=1&query=9+Rue+du+Commerce,+35140+Saint-Hilaire-des-Landes,+France";

  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle>{t.contact.findUs}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <iframe
            src={mapEmbedSrc}
            title="Map showing our location"
            className="h-full w-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-[#1a5c2a] hover:underline"
        >
          {t.contact.findUs} &rarr;
        </a>
      </CardContent>
    </Card>
  );
}
