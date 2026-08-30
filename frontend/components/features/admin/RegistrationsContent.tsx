"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ClipboardList, Download, Search, MoreHorizontal } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("ALL");

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

  const fetchData = async (status?: string, searchTerm?: string) => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchData(activeFilter, search);
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchData(filter, search);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchData(activeFilter, value);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      await adminService.updateRegistrationStatus(id, status);
      fetchData(activeFilter, search);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRegistrations = eventFilter === "ALL"
    ? registrations
    : registrations.filter((reg) => reg.event.id === eventFilter);

  const uniqueEvents = Array.from(
    new Map(registrations.map((reg) => [reg.event.id, reg.event])).values()
  );

  if (loading) return <LoadingSkeleton />;

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">REFERENCE</th>
                    <th className="px-6 py-3 font-medium">PARTICIPANT</th>
                    <th className="px-6 py-3 font-medium">EVENT</th>
                    <th className="px-6 py-3 font-medium">DATE</th>
                    <th className="px-6 py-3 font-medium">PLUS ONE</th>
                    <th className="px-6 py-3 font-medium">STATUS</th>
                    <th className="px-6 py-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-6 py-3 font-mono font-medium">
                        {reg.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium">{reg.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reg.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {reg.event.title}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {formatDate(reg.event.eventDate)}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {reg.hasPlusOne ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant="outline"
                          className={statusBadgeColor(reg.status)}
                        >
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(reg.id, "CONFIRMED")
                              }
                              disabled={updatingId === reg.id}
                            >
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(reg.id, "PENDING")
                              }
                              disabled={updatingId === reg.id}
                            >
                              Set Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(reg.id, "WAITLISTED")
                              }
                              disabled={updatingId === reg.id}
                            >
                              Waitlist
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                handleStatusChange(reg.id, "CANCELLED")
                              }
                              disabled={updatingId === reg.id}
                            >
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
