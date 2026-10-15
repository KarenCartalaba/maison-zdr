"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LoaderCircle,
  Search,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import type { AdminRegistration, CheckInEvent } from "@/types";

/** Shared border treatment for every search box on the desk. */
const SEARCH_FIELD =
  "flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 transition-colors focus-within:border-[#1a5c2a]/60 focus-within:ring-2 focus-within:ring-[#1a5c2a]/15";

/** Sits on top of a search box and matches its height. */
const SEARCH_FIELD_INPUT =
  "h-8 w-full border-0 bg-transparent shadow-none outline-none focus-visible:ring-0";

/**
 * Shell for the event selector, matching <Card> visually but deliberately not
 * using it: Card sets `overflow-hidden`, which clipped the open dropdown
 * against the card's bottom edge. This shell keeps the same surface, ring and
 * tone while letting the overlay escape, and the roomier padding stops the
 * date/guests chips from crowding the edge.
 */
const EVENT_CARD_SHELL =
  "rounded-xl bg-card py-5 text-sm text-card-foreground ring-1 ring-foreground/10 sm:py-6";

/** One row on desktop (title + badges + picker), stacked on small screens. */
const EVENT_CARD_ROW =
  "flex flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between";

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

/** Guest headcount for an event — matches the "Expected Guests" stat. */
function eventGuestCount(event: CheckInEvent): number {
  return event.expectedGuests ?? event._count.registrations;
}

/** Guests covered by a single registration: the registrant plus plus-ones. */
function guestsCovered(registration: AdminRegistration): number {
  if (registration.guestCount && registration.guestCount > 0) {
    return registration.guestCount;
  }
  return registration.hasPlusOne ? 2 : 1;
}

/** Up to two letters for the guest avatar. */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** Small uppercase eyebrow that names each section of the desk. */
function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-[#1a5c2a]" />
      {children}
    </span>
  );
}

/**
 * One attendance statistic. The three cards share a bar so the desk reads at a
 * glance: expected fills the row, the checked-in and pending bars split it.
 */
function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  percent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "neutral" | "brand" | "waiting";
  percent?: number;
}) {
  const tones = {
    neutral: {
      chip: "bg-muted text-muted-foreground",
      value: "text-foreground",
      bar: "bg-foreground/20",
    },
    brand: {
      chip: "bg-[#1a5c2a]/10 text-[#1a5c2a]",
      value: "text-[#1a5c2a]",
      bar: "bg-[#1a5c2a]",
    },
    waiting: {
      chip: "bg-yellow-500/10 text-yellow-600",
      value: "text-yellow-600",
      bar: "bg-yellow-500",
    },
  } as const;
  const styles = tones[tone];
  const width = percent ?? 100;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              styles.chip
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          {percent !== undefined && (
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {percent}%
            </span>
          )}
        </div>
        <div>
          <p className={cn("text-3xl font-bold leading-none tabular-nums", styles.value)}>
            {value}
          </p>
          <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={label}
          aria-valuenow={width}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out",
              styles.bar
            )}
            style={{ width: `${width}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="size-8 rounded-lg bg-muted" />
        <div className="h-8 w-20 rounded-lg bg-muted" />
        <div className="h-1.5 w-full rounded-full bg-muted" />
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded-lg bg-muted" />
      </div>
      <div className={EVENT_CARD_SHELL}>
        <div className={EVENT_CARD_ROW}>
          <div className="min-w-0 space-y-1.5">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-6 w-56 max-w-full rounded-lg bg-muted" />
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-5 w-28 rounded-4xl bg-muted" />
              <div className="h-5 w-36 rounded-4xl bg-muted" />
            </div>
          </div>
          <div className="h-11 w-full shrink-0 rounded-lg bg-muted lg:w-80" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({
  icon: Icon = User,
  message,
  hint,
}: {
  icon?: LucideIcon;
  message: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </span>
      <h3 className="mb-1 text-base font-medium">{message}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

/**
 * Searchable event picker (combobox): type to filter by title, pick a row to
 * scope the desk to that event, and close with Escape or an outside click.
 * Exposes combobox/listbox ARIA attributes so the filtered options are
 * announced correctly.
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
    <div ref={containerRef} className="relative w-full">
      <div className={cn(SEARCH_FIELD, "cursor-text")} onClick={() => setOpen(true)}>
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
          className={SEARCH_FIELD_INPUT}
        />
        <button
          type="button"
          aria-label={searchPlaceholder}
          onClick={() => (open ? close() : setOpen(true))}
          className="-mr-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      </div>

      {open && (
        <ul
          id="checkin-event-listbox"
          role="listbox"
          aria-label={searchPlaceholder}
          className="absolute z-30 mt-2 max-h-[min(20rem,60vh)] w-full overflow-y-auto overscroll-contain rounded-lg border bg-popover p-1.5 shadow-lg shadow-foreground/5"
        >
          {filtered.length === 0 ? (
            <li
              role="presentation"
              className="px-3 py-6 text-center text-sm text-muted-foreground"
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
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          isSelected
                            ? "bg-white/15 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Users className="h-3 w-3" />
                        {eventGuestCount(event)}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    </span>
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

  const filteredRegistrations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return registrations;
    return registrations.filter(
      (reg) =>
        reg.user.name.toLowerCase().includes(term) ||
        reg.user.email.toLowerCase().includes(term) ||
        registrationCode(reg).toLowerCase().includes(term)
    );
  }, [registrations, searchTerm]);

  const pendingGuests = Math.max(0, expectedGuests - checkedInGuests);
  const checkedInPercent =
    expectedGuests > 0
      ? Math.min(100, Math.round((checkedInGuests / expectedGuests) * 100))
      : 0;
  const pendingPercent = 100 - checkedInPercent;
  const hasRoster = Boolean(selectedEventId) && registrations.length > 0;
  const hasSearch = searchTerm.trim().length > 0;

  const checkInColumns: DataTableColumn[] = useMemo(() => [
    {
      id: "guest",
      accessorFn: (row) => row.user.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminCheckins.colGuest} />,
      cell: ({ row }) => {
        const extraGuests = guestsCovered(row.original) - 1;
        return (
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1a5c2a]/10 text-[11px] font-semibold text-[#1a5c2a]">
              {initialsOf(row.original.user.name) || (
                <User className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-medium">{row.original.user.name}</span>
                {extraGuests > 0 && (
                  <span
                    title={`${guestsCovered(row.original)} ${t.adminCheckins.expectedGuests}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    <Users className="h-2.5 w-2.5" />+{extraGuests}
                  </span>
                )}
              </span>
              <span className="block max-w-[220px] truncate text-xs text-muted-foreground">
                {row.original.user.email}
              </span>
            </span>
          </div>
        );
      },
    },
    {
      id: "reference",
      accessorFn: (row) => registrationCode(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t.adminRegs.colReference} />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {registrationCode(row.original)}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => (row.status === "CANCELLED" ? row.status : row.checkedIn ? "1" : "0"),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminCheckins.colStatus} />,
      cell: ({ row }) =>
        // Cancelled rows are part of the roster but are never "Pending" —
        // they are excluded from the Expected/Pending stats above, so they
        // get their own badge instead of masquerading as awaiting check-in.
        row.original.status === "CANCELLED" ? (
          <Badge variant="destructive">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-destructive" />
            {t.adminCheckins.cancelled}
          </Badge>
        ) : row.original.checkedIn ? (
          <Badge variant="outline" className="border-[#1a5c2a] text-[#1a5c2a]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#1a5c2a]" />
            {t.adminCheckins.checkedIn}
          </Badge>
        ) : (
          <Badge variant="secondary">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-yellow-500" />
            {t.adminCheckins.pending}
          </Badge>
        ),
    },
    {
      id: "checkInTime",
      accessorFn: (row) => row.checkedInAt ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t.adminCheckins.colCheckinTime} />
      ),
      cell: ({ row }) =>
        row.original.checkedIn && row.original.checkedInAt ? (
          <span className="tabular-nums text-muted-foreground">
            {new Date(row.original.checkedInAt).toLocaleTimeString(dateLocale, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : (
          <span className="text-muted-foreground">{"\u2014"}</span>
        ),
    },
    {
      id: "actions",
      header: t.adminCheckins.colActions,
      // No check-in action for cancelled rows (the backend would reject them);
      // already checked-in rows show the finished state instead of a button.
      cell: ({ row }) => {
        if (row.original.status === "CANCELLED") {
          return <span className="text-muted-foreground">{"\u2014"}</span>;
        }
        if (row.original.checkedIn) {
          return (
            <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
              <Check className="h-3.5 w-3.5" />
              {t.adminCheckins.checkedIn}
            </Button>
          );
        }
        const busy = checkInLoadingId === row.original.id;
        return (
          <Button
            size="sm"
            className="bg-[#1a5c2a] text-white hover:bg-[#144a22]"
            onClick={() => handleCheckIn(row.original.id)}
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {busy ? t.adminCheckins.checkingIn : t.adminCheckins.checkIn}
          </Button>
        );
      },
    },
  ], [t, dateLocale, checkInLoadingId, handleCheckIn]);

  if (loadingEvents) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{t.adminCheckins.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.adminCheckins.subtitle}
        </p>
      </header>

      {/* 1. Event selector — searchable combobox (replaces the old card grid);
          picking an event loads that event's roster (stats, search and table
          below are all scoped to it). */}
      <div
        className={cn(
          EVENT_CARD_SHELL,
          "animate-in fade-in slide-in-from-bottom-1 fill-mode-forwards duration-500"
        )}
      >
        <div className={EVENT_CARD_ROW}>
          <div className="min-w-0 space-y-1.5">
            <SectionLabel icon={CalendarDays}>{t.sidebar.events}</SectionLabel>
            {selectedEvent ? (
              <>
                <p className="truncate text-lg font-semibold" title={selectedEvent.title}>
                  {selectedEvent.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="max-w-full">
                    {formatDate(selectedEvent.eventDate, dateLocale)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="max-w-full border-[#1a5c2a]/40 text-[#1a5c2a]"
                  >
                    <Users className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 truncate">
                      {eventGuestCount(selectedEvent)} {t.adminCheckins.expectedGuests}
                    </span>
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.adminCheckins.selectEventHint}
              </p>
            )}
          </div>

          {events.length > 0 && (
            <div className="w-full shrink-0 lg:w-80">
              <EventPicker
                events={events}
                selectedEventId={selectedEventId}
                onSelect={setSelectedEventId}
                dateLocale={dateLocale}
                searchPlaceholder={t.adminCheckins.eventSearchPlaceholder}
                noResultsLabel={t.adminCheckins.eventNoResults}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Attendance statistics — backend-driven guest counts, refreshed
          after every check-in. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loadingCheckIn || !selectedEventId ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              label={t.adminCheckins.expectedGuests}
              value={expectedGuests.toLocaleString(dateLocale)}
              tone="neutral"
            />
            <StatCard
              icon={CheckCircle2}
              label={t.adminCheckins.checkedInLabel}
              value={checkedInGuests.toLocaleString(dateLocale)}
              tone="brand"
              percent={checkedInPercent}
            />
            <StatCard
              icon={Clock3}
              label={t.adminCheckins.pendingLabel}
              value={pendingGuests.toLocaleString(dateLocale)}
              tone="waiting"
              percent={pendingPercent}
            />
          </>
        )}
      </div>

      {/* 3. Guest list — search filters the roster below by name, e-mail or
          reference number (client-side, scoped to the selected event). */}
      <Card className="animate-in fade-in slide-in-from-bottom-1 fill-mode-forwards delay-150 duration-500">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 space-y-1.5">
              <SectionLabel icon={Users}>{t.sidebar.checkins}</SectionLabel>
              <h2 className="truncate text-base font-semibold">
                {selectedEvent
                  ? `${selectedEvent.title} — ${t.adminCheckins.checkInList}`
                  : t.adminCheckins.checkInList}
              </h2>
              {selectedEventId && !loadingCheckIn && (
                <p className="text-sm text-muted-foreground">
                  {hasSearch && `${filteredRegistrations.length} / ${registrations.length} \u00b7 `}
                  {expectedGuests.toLocaleString(dateLocale)} {t.adminCheckins.expectedGuests}
                </p>
              )}
            </div>

            {hasRoster && !loadingCheckIn && (
              <div className={cn(SEARCH_FIELD, "w-full shrink-0 lg:w-80")}>
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  aria-label={t.adminCheckins.searchPlaceholder}
                  placeholder={t.adminCheckins.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={SEARCH_FIELD_INPUT}
                />
              </div>
            )}
          </div>

          {loadingCheckIn ? (
            <div className="animate-pulse space-y-3 p-4 sm:p-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <EmptyState
              icon={hasSearch ? Search : User}
              // An active search that matches nothing gets the "no matches"
              // wording, not "no registrations at all".
              message={hasSearch ? t.adminRegs.emptyTitle : t.adminCheckins.emptyTitle}
              hint={hasSearch ? t.adminRegs.emptyDesc : t.adminCheckins.emptyDesc}
            />
          ) : (
            <DataTable
              columns={checkInColumns}
              data={filteredRegistrations}
              enablePagination
              enableSorting
              enableFiltering={false}
              pageSize={10}
              searchValue={searchTerm}
              getHeaderClassName={(id) =>
                id === "actions" ? "text-right" : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
