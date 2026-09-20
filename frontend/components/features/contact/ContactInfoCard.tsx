"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactInfoCard() {
  const { t } = useLanguage();
  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">{t.contact.infoTitle}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <MapPin className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{t.contact.location}</h4>
            <p className="text-sm text-muted-foreground">
              9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes, France
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <Phone className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{t.contact.phone}</h4>
            <p className="text-sm text-muted-foreground">09123456789</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <Mail className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{t.contact.emailLabel}</h4>
            <p className="text-sm text-muted-foreground">maisonzdr@gmail.com</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <Clock className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{t.contact.operationTime}</h4>
            <p className="text-sm text-muted-foreground">{t.contact.hours}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
