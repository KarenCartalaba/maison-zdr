"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
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
  const [searchTerm, setSearchTerm] = useState("");

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
        toast.success("Check-in successful");
      } else {
        toast.error(response.message || "Check-in may not have completed");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to check in"));
    } finally {
      setCheckInLoadingId(null);
    }
  };

  if (loadingEvents) return <LoadingSkeleton />;

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkInColumns: DataTableColumn[] = [
    {
      id: "guest",
      header: "GUEST",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{row.original.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "checkedIn",
      header: "STATUS",
      cell: ({ row }) => (
        <Badge
          variant={row.original.checkedIn ? "outline" : "secondary"}
          className={
            row.original.checkedIn
              ? "text-[#1a5c2a] border-[#1a5c2a]"
              : ""
          }
        >
          {row.original.checkedIn ? "Checked In" : "Pending"}
        </Badge>
      ),
    },
    {
      id: "checkInTime",
      header: "CHECK-IN TIME",
      cell: ({ row }) =>
        row.original.checkedIn && row.original.checkedInAt
          ? new Date(row.original.checkedInAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "\u2014",
    },
    {
      id: "table",
      header: "TABLE",
      cell: () => "\u2014",
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) =>
        !row.original.checkedIn ? (
          <Button
            variant="outline"
            size="sm"
            className="text-[#1a5c2a] border-[#1a5c2a]"
            onClick={() => handleCheckIn(row.original.id)}
            disabled={checkInLoadingId === row.original.id}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {checkInLoadingId === row.original.id
              ? "Checking in..."
              : "Check In"}
          </Button>
        ) : null,
    },
  ];

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

      {/* Search */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-4 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent outline-none w-full shadow-none focus-visible:ring-0"
        />
      </div>

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
          ) : filteredRegistrations.length === 0 ? (
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
            <DataTable columns={checkInColumns} data={filteredRegistrations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
