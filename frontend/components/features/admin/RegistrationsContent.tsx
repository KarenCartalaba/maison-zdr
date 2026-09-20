"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ClipboardList, Download, Search, MoreHorizontal, Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AdminRegistration, RegistrationStats } from "@/types";
const STATUS_FILTERS = ["ALL", "CONFIRMED", "PENDING", "WAITLISTED", "CANCELLED"];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadgeColor(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "text-[#1a5c2a] border-[#1a5c2a]";
    case "PENDING":
      return "text-yellow-600 border-yellow-600";
    case "WAITLISTED":
      return "text-blue-600 border-blue-600";
    case "CANCELLED":
      return "text-red-500 border-red-500";
    default:
      return "";
  }
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
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
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">No registrations found</h3>
      <p className="text-sm text-muted-foreground">
        There are no registrations matching your criteria.
      </p>
    </div>
  );
}

export default function RegistrationsContent() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("ALL");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExportCsv = () => {
    const headers = ["Reference", "Guest", "Email", "Event", "Date", "Status"];
    const rows = registrations.map((reg) => [
      reg.id,
      reg.user.name,
      reg.user.email,
      reg.event.title,
      formatDate(reg.event.eventDate),
      reg.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `registrations-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchData = async (status?: string, searchTerm?: string, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      const response = await adminService.getRegistrations({
        status: status !== "ALL" ? status : undefined,
        search: searchTerm || undefined,
      });
      if (response.data) {
        setRegistrations(response.data.registrations);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchData(activeFilter, search, true);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchData(filter, search, true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchData(activeFilter, value);
    }, 400);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      await adminService.updateRegistrationStatus(id, status);
      fetchData(activeFilter, search);
      toast.success("Registration status updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const registrationColumns: DataTableColumn[] = [
    {
      accessorKey: "referenceNumber",
      header: "REFERENCE",
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.referenceNumber || row.original.id.substring(0, 8)}
        </span>
      ),
    },
    {
      id: "participant",
      header: "PARTICIPANT",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.user.email}
          </p>
        </div>
      ),
    },
    {
      id: "event",
      header: "EVENT",
      cell: ({ row }) => row.original.event.title,
    },
    {
      id: "date",
      header: "DATE",
      cell: ({ row }) => formatDate(row.original.event.eventDate),
    },
    {
      id: "plusOne",
      header: "PLUS ONE",
      cell: ({ row }) => (row.original.hasPlusOne ? "Yes" : "No"),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={statusBadgeColor(row.original.status)}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(row.original.id, "CONFIRMED")
                }
                disabled={updatingId === row.original.id}
              >
                Confirm
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(row.original.id, "PENDING")
                }
                disabled={updatingId === row.original.id}
              >
                Set Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(row.original.id, "WAITLISTED")
                }
                disabled={updatingId === row.original.id}
              >
                Waitlist
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                handleStatusChange(row.original.id, "CANCELLED")
              }
              disabled={updatingId === row.original.id}
            >
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredRegistrations = eventFilter === "ALL"
    ? registrations
    : registrations.filter((reg) => reg.event.id === eventFilter);

  const uniqueEvents = Array.from(
    new Map(registrations.map((reg) => [reg.event.id, reg.event])).values()
  );

  if (loading && registrations.length === 0) return <LoadingSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Registrations</h1>
          <p className="text-sm text-muted-foreground">
            Manage all event registrations
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCsv}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search registrations..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 bg-transparent outline-none w-full"
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="ALL">All Events</option>
            {uniqueEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(filter)}
              className={
                activeFilter === filter ? "bg-[#1a5c2a] hover:bg-[#144a22]" : ""
              }
            >
              {filter.charAt(0) + filter.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Registrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c2a]">
                {stats.confirmed.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">
                {stats.cancelled.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      {filteredRegistrations.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable columns={registrationColumns} data={filteredRegistrations} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
