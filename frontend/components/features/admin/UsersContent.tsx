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
import { Search, Users, User, MoreHorizontal, Inbox } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AdminUser, UserStats } from "@/types";

const FILTER_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Unverified", value: "UNVERIFIED" },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">No users found</h3>
      <p className="text-sm text-muted-foreground">
        There are no users matching your criteria.
      </p>
    </div>
  );
}

export default function UsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async (role?: string, searchTerm?: string) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        role: role !== "ALL" ? role : undefined,
        search: searchTerm || undefined,
      });
      if (response.data) {
        setUsers(response.data.users);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
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

  const handleRoleChange = async (id: string, role: string) => {
    try {
      setActionLoading(id);
      await adminService.updateUserRole(id, role);
      fetchData(activeFilter, search);
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and roles
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c2a]">
                {stats.verified.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.unverified.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Pending Verification
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 bg-transparent outline-none w-full"
          />
        </div>
        <div className="flex gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(filter.value)}
              className={
                activeFilter === filter.value
                  ? "bg-[#1a5c2a] hover:bg-[#144a22]"
                  : ""
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
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
                    <th className="px-6 py-3 font-medium">USER</th>
                    <th className="px-6 py-3 font-medium">ROLE</th>
                    <th className="px-6 py-3 font-medium">EMAIL STATUS</th>
                    <th className="px-6 py-3 font-medium">REGISTRATIONS</th>
                    <th className="px-6 py-3 font-medium">JOINED</th>
                    <th className="px-6 py-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={u.role === "ADMIN" ? "default" : "secondary"}
                          className={
                            u.role === "ADMIN" ? "bg-[#1a5c2a]" : ""
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={u.emailVerified ? "outline" : "secondary"}
                          className={
                            u.emailVerified
                              ? "text-[#1a5c2a] border-[#1a5c2a]"
                              : ""
                          }
                        >
                          {u.emailVerified ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {u._count.registrations}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.id, "ADMIN")}
                              disabled={actionLoading === u.id}
                            >
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(u.id, "USER")}
                              disabled={actionLoading === u.id}
                            >
                              Make User
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
