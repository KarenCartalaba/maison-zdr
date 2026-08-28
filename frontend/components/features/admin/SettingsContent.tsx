"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Bell, Shield, Globe, Palette } from "lucide-react";

export default function SettingsContent() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage system and notification settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Venue Name</label>
              <input
                type="text"
                defaultValue="Maison ZDR"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Email</label>
              <input
                type="email"
                defaultValue="contact@maisonzdr.com"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Default Timezone</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                <option>Europe/Paris (CET)</option>
                <option>Europe/London (GMT)</option>
                <option>America/New_York (EST)</option>
              </select>
            </div>
            <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "New registration alerts", description: "Get notified when someone registers", enabled: true },
              { label: "Event reminders", description: "24h before event starts", enabled: true },
              { label: "Weekly report", description: "Summary of registrations and check-ins", enabled: false },
              { label: "New review alerts", description: "Get notified when a review is submitted", enabled: true },
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
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">Not Enabled</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Session Timeout</p>
                <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <select className="px-3 py-1 border rounded text-sm">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Login Notifications</p>
                <p className="text-xs text-muted-foreground">Alert on new device login</p>
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
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-8 w-8 rounded bg-[#1a5c2a] border-2 border-foreground cursor-pointer" />
                <div className="h-8 w-8 rounded bg-blue-600 border-2 border-transparent cursor-pointer" />
                <div className="h-8 w-8 rounded bg-purple-600 border-2 border-transparent cursor-pointer" />
                <div className="h-8 w-8 rounded bg-orange-500 border-2 border-transparent cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Logo</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center font-bold text-lg">Z</div>
                <Button variant="outline" size="sm">Upload New Logo</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Footer Text</label>
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
