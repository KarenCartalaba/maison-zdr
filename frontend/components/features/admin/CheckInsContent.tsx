"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Search, CheckCircle2, User, CalendarDays } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import type { AdminRegistration, CheckInEvent } from "@/types";

/**
 * Registration/reference code shown for a guest in the check-in roster.
 * The check-in API returns the full registration row, so the server-issued
 * `referenceNumber` (e.g. ZDR-B12-411122) is shown whenever it exists. Rows
 * created before reference numbers were persisted fall back to a deterministic
 * id-based code — the same `MZ-XXXXXX` derivation the admin dashboard uses.
 */
function registrationCode(registration: AdminRegistration): string {
  return (
    registration.referenceNumber ||
    `MZ-${registration.id.slice(0, 6).toUpperCase()}`
  );
}

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

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

/**
 * Searchable event picker (combobox) replacing the old card grid: type to
 * filter by title, pick a row to scope the desk to that event, and close with
 * Escape or an outside click. Exposes combobox/listbox ARIA attributes so the
 * filtered options are announced correctly.
 */
function EventPicker({
  events,
  selectedEventId,
  onSelect,
  dateLocale,
  searchPlaceholder,
  noResultsLabel,
}: {
  events: CheckInEvent[];
  selectedEventId: string;
  onSelect: (id: string) => void;
  dateLocale: string;
  searchPlaceholder: string;
  noResultsLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // While closed the input mirrors the selected title; while open it shows the
  // raw query, so filtering never hides which event is currently active.
  const inputValue = open ? query : selectedEvent?.title ?? "";

  const filtered = events.filter((event) =>
    event.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative mb-6 max-w-md">
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          role="combobox"
          aria-expanded={open}
          aria-controls="checkin-event-listbox"
          aria-autocomplete="list"
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length > 0) {
                onSelect(filtered[0].id);
                close();
              }
            }
          }}
          className="w-full border-0 bg-transparent shadow-none outline-none focus-visible:ring-0"
        />
      </div>

      {open && (
        <ul
          id="checkin-event-listbox"
          role="listbox"
          aria-label={searchPlaceholder}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-md"
        >
          {filtered.length === 0 ? (
            <li
              role="presentation"
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              {noResultsLabel}
            </li>
          ) : (
            filtered.map((event) => {
              const isSelected = event.id === selectedEventId;
              return (
                <li key={event.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(event.id);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors",
                      isSelected ? "bg-[#1a5c2a] text-white" : "hover:bg-muted"
                    )}
                  >
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          isSelected ? "text-white/70" : "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(event.eventDate, dateLocale)}
                      </span>
                      <span className="block truncate text-sm font-medium">
                        {event.title}
                        <span
                          className={cn(
                            "ml-1 text-xs font-normal",
                            isSelected ? "text-white/70" : "text-muted-foreground"
                          )}
                        >
                          ({event._count.registrations})
                        </span>
                      </span>
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

interface CheckInsContentProps {
  initialEvents?: CheckInEvent[] | null;
  initialCheckIn?: {
    event?: { id: string } | null;
    registrations: AdminRegistration[];
    /** Guest-headcount stats: registrants + plus-ones, cancelled excluded. */
    expectedGuests?: number;
    checkedInGuests?: number;
    expectedRegistrations?: number;
    checkedInRegistrations?: number;
    cancelledRegistrations?: number;
    /** Back-compat aliases returned by the API (== the two fields above). */
    totalCount?: number;
    checkedInCount?: number;
  } | null;
}

export default function CheckInsContent({
  initialEvents = null,
  initialCheckIn = null,
}: CheckInsContentProps) {
  const [events, setEvents] = useState<CheckInEvent[]>(initialEvents ?? []);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEvents?.[0]?.id ?? "");
  const [registrations, setRegistrations] = useState<AdminRegistration[]>(initialCheckIn?.registrations ?? []);
  // Guest-headcount stats (registrant + plus-ones; CANCELLED rows excluded).
  const [checkedInGuests, setCheckedInGuests] = useState(
    initialCheckIn?.checkedInGuests ?? initialCheckIn?.checkedInCount ?? 0
  );
  const [expectedGuests, setExpectedGuests] = useState(
    initialCheckIn?.expectedGuests ?? initialCheckIn?.totalCount ?? 0
  );
  const [loadingEvents, setLoadingEvents] = useState(!initialEvents);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [checkInLoadingId, setCheckInLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Server-rendered roster is for the auto-selected (first) event; consume it
  // once so re-selecting that event after visiting another still fetches.
  const initialCheckInRef = useRef(
    initialEvents?.[0]?.id && initialCheckIn
      ? { eventId: initialEvents[0].id, data: initialCheckIn }
      : null
  );
  const { t, dateLocale } = useLanguage();

  useEffect(() => {
    // Skip the client fetch when the page already provided server-rendered data.
    if (initialEvents) {
      setLoadingEvents(false);
      return;
    }
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
  }, [initialEvents]);

  /** Reload the selected event's roster + stats (single source of truth). */
  const refreshRoster = useCallback(async () => {
    const response = await adminService.getEventCheckIn(selectedEventId);
    if (response.data) {
      setRegistrations(response.data.registrations);
      setCheckedInGuests(
        response.data.checkedInGuests ?? response.data.checkedInCount ?? 0
      );
      setExpectedGuests(
        response.data.expectedGuests ?? response.data.totalCount ?? 0
      );
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) return;
    // Skip the client fetch when the server already provided this event's data.
    if (initialCheckInRef.current?.eventId === selectedEventId) {
      initialCheckInRef.current = null;
      setLoadingCheckIn(false);
      return;
    }
    const fetchCheckIn = async () => {
      try {
        setLoadingCheckIn(true);
        await refreshRoster();
      } catch (error) {
        console.error("Failed to fetch check-in data:", error);
      } finally {
        setLoadingCheckIn(false);
      }
    };
    fetchCheckIn();
  }, [refreshRoster, selectedEventId]);

  const handleCheckIn = useCallback(async (registrationId: string) => {
    setCheckInLoadingId(registrationId);
    let succeeded = false;
    try {
      await adminService.checkIn(registrationId);
      succeeded = true;
    } catch (error) {
      // Duplicate/cancelled rejections return the server's own message
      // ("Already checked in", ...) — surface it verbatim, not the fallback.
      toast.error(getErrorMessage(error, t.adminCheckins.checkInError));
    }
    // Always refresh: a success updates counts + the row, and a duplicate
    // rejection flips a stale "Pending" row to its real checked-in state.
    try {
      await refreshRoster();
    } catch {
      // Best-effort: keep the current roster if the refresh itself fails.
    }
    if (succeeded) toast.success(t.adminCheckins.checkInSuccess);
    setCheckInLoadingId(null);
  }, [refreshRoster, t]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const filteredRegistrations = registrations.filter((reg) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      reg.user.name.toLowerCase().includes(term) ||
      reg.user.email.toLowerCase().includes(term) ||
      registrationCode(reg).toLowerCase().includes(term)
    );
  });

  const checkInColumns: DataTableColumn[] = useMemo(() => [
    {
      id: "reference",
      accessorFn: (row) => registrationCode(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t.adminRegs.colReference} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium text-xs">
          {registrationCode(row.original)}
        </span>
      ),
    },
    {
      id: "guest",
      accessorFn: (row) => row.user.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminCheckins.colGuest} />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminCheckins.colStatus} />,
      cell: ({ row }) => (
        <Badge
          variant={row.original.checkedIn ? "outline" : "secondary"}
          className={
            row.original.checkedIn
              ? "text-[#1a5c2a] border-[#1a5c2a]"
              : ""
          }
        >
          {row.original.checkedIn ? t.adminCheckins.checkedIn : t.adminCheckins.pending}
        </Badge>
      ),
    },
    {
      id: "checkInTime",
      header: t.adminCheckins.colCheckinTime,
      cell: ({ row }) =>
        row.original.checkedIn && row.original.checkedInAt
          ? new Date(row.original.checkedInAt).toLocaleTimeString(dateLocale, {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "\u2014",
    },
    {
      id: "table",
      header: t.adminCheckins.colTable,
      cell: () => "\u2014",
    },
    {
      id: "actions",
      header: t.adminCheckins.colActions,
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
              ? t.adminCheckins.checkingIn
              : t.adminCheckins.checkIn}
          </Button>
        ) : null,
    },
  ], [t, dateLocale, checkInLoadingId, handleCheckIn]);

  if (loadingEvents) return <LoadingSkeleton />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.adminCheckins.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.adminCheckins.subtitle}
        </p>
      </div>

      {/* Event picker — searchable combobox (replaces the old card grid);
          picking an event loads that event's roster (stats, search and table
          below are all scoped to it). */}
      {events.length > 0 && (
        <EventPicker
          events={events}
          selectedEventId={selectedEventId}
          onSelect={setSelectedEventId}
          dateLocale={dateLocale}
          searchPlaceholder={t.adminCheckins.eventSearchPlaceholder}
          noResultsLabel={t.adminCheckins.eventNoResults}
        />
      )}

      {/* Stats */}
      {selectedEventId && !loadingCheckIn && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{expectedGuests.toLocaleString(dateLocale)}</p>
              <p className="text-xs text-muted-foreground">{t.adminCheckins.expectedGuests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c2a]">
                {checkedInGuests.toLocaleString(dateLocale)}
              </p>
              <p className="text-xs text-muted-foreground">{t.adminCheckins.checkedInLabel}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {(expectedGuests - checkedInGuests).toLocaleString(dateLocale)}
              </p>
              <p className="text-xs text-muted-foreground">{t.adminCheckins.pendingLabel}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Check-in List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selectedEvent
              ? `${selectedEvent.title} — ${t.adminCheckins.checkInList}`
              : t.adminCheckins.checkInList}
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
                {t.adminCheckins.emptyTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.adminCheckins.emptyDesc}
              </p>
            </div>
          ) : (
            <DataTable
              columns={checkInColumns}
              data={filteredRegistrations}
              enablePagination
              enableSorting
              enableFiltering={false}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
