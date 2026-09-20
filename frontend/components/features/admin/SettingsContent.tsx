"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Bell, Shield, Globe, Palette } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsContent() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminSettings.title}</h1>
          <p className="text-sm text-muted-foreground">{t.adminSettings.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.adminSettings.general}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.adminSettings.venueName}</label>
              <input
                type="text"
                defaultValue="Maison ZDR"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.adminSettings.contactEmail}</label>
              <input
                type="email"
                defaultValue="contact@maisonzdr.com"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.adminSettings.defaultTimezone}</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                <option>Europe/Paris (CET)</option>
                <option>Europe/London (GMT)</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
            <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
              <Save className="h-4 w-4 mr-2" />
              {t.adminSettings.saveChanges}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t.adminSettings.notifications}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: t.adminSettings.notifRegistrationTitle, description: t.adminSettings.notifRegistrationDesc, enabled: true },
              { label: t.adminSettings.notifReminderTitle, description: t.adminSettings.notifReminderDesc, enabled: true },
              { label: t.adminSettings.notifWeeklyTitle, description: t.adminSettings.notifWeeklyDesc, enabled: false },
              { label: t.adminSettings.notifReviewTitle, description: t.adminSettings.notifReviewDesc, enabled: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <div className={`h-5 w-9 rounded-full relative cursor-pointer ${item.enabled ? "bg-[#1a5c2a]" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${item.enabled ? "left-4" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t.adminSettings.security}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{t.adminSettings.twoFactor}</p>
                <p className="text-xs text-muted-foreground">{t.adminSettings.twoFactorDesc}</p>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">{t.adminSettings.twoFactorNotEnabled}</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{t.adminSettings.sessionTimeout}</p>
                <p className="text-xs text-muted-foreground">{t.adminSettings.sessionTimeoutDesc}</p>
              </div>
              <select className="px-3 py-1 border rounded text-sm">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{t.adminSettings.loginNotifications}</p>
                <p className="text-xs text-muted-foreground">{t.adminSettings.loginNotificationsDesc}</p>
              </div>
              <div className="h-5 w-9 rounded-full relative cursor-pointer bg-[#1a5c2a]">
                <div className="absolute top-0.5 left-4 h-4 w-4 rounded-full bg-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t.adminSettings.appearance}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.adminSettings.primaryColor}</label>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-8 w-8 rounded bg-[#1a5c2a] border-2 border-foreground cursor-pointer" />
                <div className="h-8 w-8 rounded bg-blue-600 border-2 border-transparent cursor-pointer" />
                <div className="h-8 w-8 rounded bg-purple-600 border-2 border-transparent cursor-pointer" />
                <div className="h-8 w-8 rounded bg-orange-500 border-2 border-transparent cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t.adminSettings.logo}</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center font-bold text-lg">Z</div>
                <Button variant="outline" size="sm">{t.adminSettings.uploadLogo}</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t.adminSettings.footerText}</label>
              <input
                type="text"
                defaultValue="© 2026 Maison ZDR. All rights reserved."
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
