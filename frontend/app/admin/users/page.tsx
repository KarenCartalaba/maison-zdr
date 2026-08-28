import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground mt-2">View and manage user accounts</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            User management coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
