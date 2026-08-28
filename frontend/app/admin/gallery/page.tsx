"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

export default function AdminGalleryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Gallery</h1>
        <p className="text-muted-foreground mt-2">Upload and manage event photos</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Gallery management coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
