"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { registrationService } from "@/services/registration.service";
import { Button } from "@/components/ui/button";
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
  const { t, dateLocale } = useLanguage();
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [isLoading, setIsLoading] = useState(initialRegistrations.length === 0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  // Always reflect the latest server data (e.g. after a delete + refresh)
  useEffect(() => {
    setRegistrations(initialRegistrations);
    if (initialRegistrations.length > 0) setIsLoading(false);
  }, [initialRegistrations]);

  const handleCancel = async (registration: Registration) => {
    if (!registration.eventId) return;
    try {
      setCancellingId(registration.id);
      const res = await registrationService.cancel(registration.eventId);
      if (res.code === 200) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === registration.id ? { ...r, status: "CANCELLED" } : r))
        );
        toast.success(t.myRegs.registrationCancelled);
      } else {
        toast.error(res.message || t.myRegs.failedCancelRegistration);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, t.myRegs.failedCancelRegistration));
    } finally {
      setCancellingId(null);
    }
  };

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
      {dialog}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.myRegs.heading}</h1>
        <p className="text-muted-foreground mt-2">{t.myRegs.subtitle}</p>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">{t.myRegs.emptyState}</p>
            <Link href="/events" className="text-primary hover:underline">{t.myRegs.browseEvents}</Link>
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
                        {new Date(registration.event.eventDate).toLocaleDateString(dateLocale)}
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
                    <p className="text-sm text-muted-foreground mt-1">{t.myRegs.plusOne} {registration.guestName}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={registration.status === "CONFIRMED" ? "default" : "destructive"}>
                    {registration.status}
                  </Badge>
                  {registration.status !== "CANCELLED" && !registration.event?.isCancelled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={cancellingId === registration.id}
                      onClick={() =>
                        confirm({
                          title: t.myRegs.confirmCancelTitle,
                          description: t.myRegs.confirmCancelDescription.replace("{title}", registration.event?.title || "this event"),
                          confirmLabel: t.myRegs.confirmYesCancel,
                          onConfirm: () => handleCancel(registration),
                        })
                      }
                    >
                      {cancellingId === registration.id ? t.myRegs.cancelling : t.myRegs.cancelRegistration}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
