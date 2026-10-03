"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Bell, Shield, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// The API has no settings endpoints yet, so admin preferences are persisted
// client-side (same pattern as the language preference).
const STORAGE_KEY = "maison-zdr:admin-settings";

type GeneralSettings = {
  venueName: string;
  contactEmail: string;
  timezone: string;
};

type SettingsState = {
  general: GeneralSettings;
  notifications: {
    registration: boolean;
    reminder: boolean;
    weekly: boolean;
    review: boolean;
  };
  sessionTimeout: string;
  loginNotifications: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  general: {
    venueName: "Maison ZDR",
    contactEmail: "contact@maisonzdr.com",
    timezone: "Europe/Paris (CET)",
  },
  notifications: {
    registration: true,
    reminder: true,
    weekly: false,
    review: true,
  },
  sessionTimeout: "30 minutes",
  loginNotifications: true,
};

function readStoredSettings(): SettingsState {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      general: { ...DEFAULT_SETTINGS.general, ...(parsed.general ?? {}) },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications ?? {}),
      },
      sessionTimeout:
        parsed.sessionTimeout ?? DEFAULT_SETTINGS.sessionTimeout,
      loginNotifications:
        typeof parsed.loginNotifications === "boolean"
          ? parsed.loginNotifications
          : DEFAULT_SETTINGS.loginNotifications,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function SettingsContent() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  // Hydrate from storage on mount (localStorage is unavailable during SSR).
  useEffect(() => {
    setSettings(readStoredSettings());
  }, []);

  const updateGeneral = (patch: Partial<GeneralSettings>) =>
    setSettings((prev) => ({ ...prev, general: { ...prev.general, ...patch } }));

  const toggleNotification = (key: keyof SettingsState["notifications"]) =>
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));

  const handleSave = () => {
    setIsSaving(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success(t.adminSettings.saveSuccess);
    } catch {
      toast.error(t.adminSettings.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationItems: Array<{
    key: keyof SettingsState["notifications"];
    label: string;
    description: string;
  }> = [
    {
      key: "registration",
      label: t.adminSettings.notifRegistrationTitle,
      description: t.adminSettings.notifRegistrationDesc,
    },
    {
      key: "reminder",
      label: t.adminSettings.notifReminderTitle,
      description: t.adminSettings.notifReminderDesc,
    },
    {
      key: "weekly",
      label: t.adminSettings.notifWeeklyTitle,
      description: t.adminSettings.notifWeeklyDesc,
    },
    {
      key: "review",
      label: t.adminSettings.notifReviewTitle,
      description: t.adminSettings.notifReviewDesc,
    },
  ];

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
              <label className="text-sm font-medium" htmlFor="settings-venue-name">
                {t.adminSettings.venueName}
              </label>
              <input
                id="settings-venue-name"
                type="text"
                value={settings.general.venueName}
                onChange={(e) => updateGeneral({ venueName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="settings-contact-email">
                {t.adminSettings.contactEmail}
              </label>
              <input
                id="settings-contact-email"
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) => updateGeneral({ contactEmail: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="settings-timezone">
                {t.adminSettings.defaultTimezone}
              </label>
              <select
                id="settings-timezone"
                value={settings.general.timezone}
                onChange={(e) => updateGeneral({ timezone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              >
                <option>Europe/Paris (CET)</option>
                <option>Europe/London (GMT)</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
            <Button
              type="button"
              className="bg-[#1a5c2a] hover:bg-[#144a22]"
              onClick={handleSave}
              disabled={isSaving}
            >
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
            {notificationItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notifications[item.key]}
                  aria-label={item.label}
                  onClick={() => toggleNotification(item.key)}
                  className={`h-5 w-9 rounded-full relative cursor-pointer transition-colors ${
                    settings.notifications[item.key] ? "bg-[#1a5c2a]" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      settings.notifications[item.key] ? "left-4" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
            <Button
              type="button"
              className="bg-[#1a5c2a] hover:bg-[#144a22]"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {t.adminSettings.saveChanges}
            </Button>
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
                <p className="text-sm font-medium">{t.adminSettings.sessionTimeout}</p>
                <p className="text-xs text-muted-foreground">{t.adminSettings.sessionTimeoutDesc}</p>
              </div>
              <select
                aria-label={t.adminSettings.sessionTimeout}
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))
                }
                className="px-3 py-1 border rounded text-sm"
              >
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
              <button
                type="button"
                role="switch"
                aria-checked={settings.loginNotifications}
                aria-label={t.adminSettings.loginNotifications}
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    loginNotifications: !prev.loginNotifications,
                  }))
                }
                className={`h-5 w-9 rounded-full relative cursor-pointer transition-colors ${
                  settings.loginNotifications ? "bg-[#1a5c2a]" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.loginNotifications ? "left-4" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <Button
              type="button"
              className="bg-[#1a5c2a] hover:bg-[#144a22]"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {t.adminSettings.saveChanges}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
