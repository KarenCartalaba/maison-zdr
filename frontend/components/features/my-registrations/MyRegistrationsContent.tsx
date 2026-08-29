"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { registrationService } from "@/services/registration.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import type { Registration } from "@/types";

interface MyRegistrationsContentProps {
  initialRegistrations?: Registration[];
}

export default function MyRegistrationsContent({ initialRegistrations = [] }: MyRegistrationsContentProps) {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [isLoading, setIsLoading] = useState(initialRegistrations.length === 0);

  useEffect(() => {
    if (initialRegistrations.length > 0) return; // Already have SSR data
    const fetchRegistrations = async () => {
      if (!user) return;
      try {
        const response = await registrationService.getByUser(user.id);
        if (response.code === 200 && response.data) {
          setRegistrations(response.data.registrations);
        }
      } catch (err: any) {
        console.error("Failed to fetch registrations:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegistrations();
  }, [user, initialRegistrations.length]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <p className="text-muted-foreground mt-2">View your event registrations</p>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">You haven&apos;t registered for any events yet.</p>
            <Link href="/events" className="text-primary hover:underline">Browse Events</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <Card key={registration.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <h3 className="font-semibold">{registration.event?.title || "Event"}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {registration.event?.eventDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(registration.event.eventDate).toLocaleDateString()}
                      </span>
                    )}
                    {registration.event?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {registration.event.location}
                      </span>
                    )}
                  </div>
                  {registration.hasPlusOne && registration.guestName && (
                    <p className="text-sm text-muted-foreground mt-1">Plus-one: {registration.guestName}</p>
                  )}
                </div>
                <Badge variant={registration.status === "CONFIRMED" ? "default" : "destructive"}>
                  {registration.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
