"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Search, CheckCircle2, User, CalendarDays } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AdminRegistration, CheckInEvent } from "@/types";

function LoadingSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-8 w-16 bg-muted rounded mx-auto mb-2" />
              <div className="h-3 w-24 bg-muted rounded mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground">
        Select an event above to view check-in details.
      </p>
    </div>
  );
}

export default function CheckInsContent() {
  const [events, setEvents] = useState<CheckInEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [checkInLoadingId, setCheckInLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const response = await adminService.getCheckInEvents();
        if (response.data) {
          setEvents(response.data.events ?? []);
          if ((response.data.events ?? []).length > 0) {
            setSelectedEventId(response.data.events[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch check-in events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    const fetchCheckIn = async () => {
      try {
        setLoadingCheckIn(true);
        const response = await adminService.getEventCheckIn(selectedEventId);
        if (response.data) {
          setRegistrations(response.data.registrations);
          setCheckedInCount(response.data.checkedInCount);
          setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch check-in data:", error);
      } finally {
        setLoadingCheckIn(false);
      }
    };
    fetchCheckIn();
  }, [selectedEventId]);

  const handleCheckIn = async (registrationId: string) => {
    try {
      setCheckInLoadingId(registrationId);
      await adminService.checkIn(registrationId);
      // Refresh check-in data
      const response = await adminService.getEventCheckIn(selectedEventId);
      if (response.data) {
        setRegistrations(response.data.registrations);
        setCheckedInCount(response.data.checkedInCount);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error("Failed to check in:", error);
    } finally {
      setCheckInLoadingId(null);
    }
  };

  if (loadingEvents) return <LoadingSkeleton />;

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Check-in Desk</h1>
          <p className="text-sm text-muted-foreground">
            Scan QR code or manually check in participants
          </p>
        </div>
        <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR Code
        </Button>
      </div>

      {/* Event Selector */}
      {events.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {events.map((event) => (
            <Button
              key={event.id}
              variant={selectedEventId === event.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedEventId(event.id)}
              className={
                selectedEventId === event.id
                  ? "bg-[#1a5c2a] hover:bg-[#144a22] whitespace-nowrap"
                  : "whitespace-nowrap"
              }
            >
              {event.title}
              <span className="ml-1 text-xs opacity-70">
                ({event._count.registrations})
              </span>
            </Button>
          ))}
        </div>
      )}

      {/* Stats */}
      {selectedEventId && !loadingCheckIn && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Expected Guests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c2a]">
                {checkedInCount}
              </p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {totalCount - checkedInCount}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Check-in List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedEvent
              ? `${selectedEvent.title} — Check-in List`
              : "Check-in List"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingCheckIn ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-muted rounded" />
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">
                No registrations for this event
              </h3>
              <p className="text-sm text-muted-foreground">
                There are no registrations to check in.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">GUEST</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                    <th className="px-6 py-3 font-medium">CHECK-IN TIME</th>
                    <th className="px-6 py-3 font-medium">TABLE</th>
                    <th className="px-6 py-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((guest) => (
                    <tr
                      key={guest.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{guest.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {guest.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={guest.checkedIn ? "outline" : "secondary"}
                          className={
                            guest.checkedIn
                              ? "text-[#1a5c2a] border-[#1a5c2a]"
                              : ""
                          }
                        >
                          {guest.checkedIn ? "Checked In" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {guest.checkedIn && guest.checkedInAt
                          ? new Date(guest.checkedInAt).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "—"}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">—</td>
                      <td className="px-6 py-3">
                        {!guest.checkedIn && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[#1a5c2a] border-[#1a5c2a]"
                            onClick={() => handleCheckIn(guest.id)}
                            disabled={checkInLoadingId === guest.id}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {checkInLoadingId === guest.id
                              ? "Checking in..."
                              : "Check In"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
