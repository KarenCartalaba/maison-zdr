"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Search,
  Users,
  User,
  MoreHorizontal,
  Inbox,
  Shield,
  Mail,
  Calendar,
  Ban,
  X,
  Loader2,
} from "lucide-react";
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
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async (role?: string, searchTerm?: string, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsSearching(true);
      }
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
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchData(activeFilter, search, true);
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
    }, 300);
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

  const handleVerifyUser = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.verifyUser(id);
      fetchData(activeFilter, search);
    } catch (error) {
      console.error("Failed to verify user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.suspendUser(id);
      fetchData(activeFilter, search);
    } catch (error) {
      console.error("Failed to suspend/unsuspend user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(id);
      await adminService.deleteUser(id);
      fetchData(activeFilter, search);
    } catch (error) {
      console.error("Failed to delete user:", error);
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
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
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
                          variant={u.role === "ADMIN" ? "default" : u.role === "MODERATOR" ? "default" : "secondary"}
                          className={
                            u.role === "ADMIN"
                              ? "bg-[#1a5c2a]"
                              : u.role === "MODERATOR"
                                ? "bg-blue-600"
                                : ""
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
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => setSelectedUser(u)}
                              disabled={actionLoading === u.id}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(u.id, "ADMIN")}
                                disabled={actionLoading === u.id}
                              >
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(u.id, "MODERATOR")}
                                disabled={actionLoading === u.id}
                              >
                                Make Moderator
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(u.id, "USER")}
                                disabled={actionLoading === u.id}
                              >
                                Make User
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            {!u.emailVerified && (
                              <DropdownMenuItem
                                onClick={() => handleVerifyUser(u.id)}
                                disabled={actionLoading === u.id}
                              >
                                Verify User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleSuspendUser(u.id)}
                              disabled={actionLoading === u.id}
                            >
                              {u.suspended ? "Unsuspend User" : "Suspend User"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={actionLoading === u.id}
                              className="text-red-600"
                            >
                              Delete User
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

      {/* View Profile Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">User Profile</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold">{selectedUser.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Role
                </div>
                <Badge
                  variant={selectedUser.role === "ADMIN" ? "default" : selectedUser.role === "MODERATOR" ? "default" : "secondary"}
                  className={
                    selectedUser.role === "ADMIN"
                      ? "bg-[#1a5c2a]"
                      : selectedUser.role === "MODERATOR"
                        ? "bg-blue-600"
                        : ""
                  }
                >
                  {selectedUser.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Status
                </div>
                <Badge
                  variant={selectedUser.emailVerified ? "outline" : "secondary"}
                  className={
                    selectedUser.emailVerified
                      ? "text-[#1a5c2a] border-[#1a5c2a]"
                      : ""
                  }
                >
                  {selectedUser.emailVerified ? "Verified" : "Pending"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Ban className="h-4 w-4" />
                  Suspended
                </div>
                <Badge
                  variant={selectedUser.suspended ? "destructive" : "outline"}
                >
                  {selectedUser.suspended ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Registrations
                </div>
                <span className="text-sm font-medium">
                  {selectedUser._count.registrations}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </div>
                <span className="text-sm font-medium">
                  {formatDate(selectedUser.createdAt)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
