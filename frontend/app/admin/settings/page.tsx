import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage system settings</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Settings page coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
