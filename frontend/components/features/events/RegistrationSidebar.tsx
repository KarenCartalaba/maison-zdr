"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface RegistrationSidebarProps {
  eventId: string;
  maxParticipants: number;
  registeredCount: number;
  status: string;
  isDeadlinePassed: boolean;
}

export default function RegistrationSidebar({
  eventId,
  maxParticipants,
  registeredCount,
  status,
  isDeadlinePassed,
}: RegistrationSidebarProps) {
  const { isAuthenticated, isVerified } = useAuth();
  const available = maxParticipants - registeredCount;
  const percentage = (registeredCount / maxParticipants) * 100;

  return (
    <Card className="border shadow-md">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Registration availability</span>
          <span className="text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[#1a5c2a]"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold">{maxParticipants}</div>
            <div className="text-xs text-muted-foreground">Max</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold">{registeredCount}</div>
            <div className="text-xs text-muted-foreground">Registered</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-2xl font-bold">{available}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">{status}</span>
        </div>

        {/* Registration button logic */}
        {!isAuthenticated ? (
          <Link href="/login">
            <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">
              Login to Register
            </Button>
          </Link>
        ) : !isVerified ? (
          <div className="space-y-2">
            <Link href="/verify-email">
              <Button variant="outline" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Verify Email to Register
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center">
              You must verify your email to register for events
            </p>
          </div>
        ) : isDeadlinePassed ? (
          <Button className="w-full" disabled>
            Registration Closed
          </Button>
        ) : (
          <Link href={`/events/${eventId}/register`}>
            <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">
              Register Event
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
