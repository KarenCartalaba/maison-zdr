"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { useConfirm } from "@/components/ui/confirm-dialog";
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
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
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
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import type { AdminUser, UserStats } from "@/types";

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

function EmptyState({ t }: { t: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">{t.adminUsers.emptyTitle}</h3>
      <p className="text-sm text-muted-foreground">
        {t.adminUsers.emptyDesc}
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
  const { confirm, dialog } = useConfirm();
  const { t, dateLocale } = useLanguage();

  const FILTER_OPTIONS = useMemo(() => [
    { label: t.adminUsers.filterAll, value: "ALL" },
    { label: t.adminUsers.filterAdmin, value: "ADMIN" },
    { label: t.adminUsers.filterVerified, value: "VERIFIED" },
    { label: t.adminUsers.filterUnverified, value: "UNVERIFIED" },
  ], [t]);

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
      toast.success(t.adminUsers.roleUpdated);
    } catch (error) {
      toast.error(getErrorMessage(error, t.adminUsers.roleError));
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyUser = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.verifyUser(id);
      fetchData(activeFilter, search);
      toast.success(t.adminUsers.verifiedSuccess);
    } catch (error) {
      toast.error(getErrorMessage(error, t.adminUsers.verifiedError));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.suspendUser(id);
      fetchData(activeFilter, search);
      toast.success(t.adminUsers.suspendSuccess);
    } catch (error) {
      toast.error(getErrorMessage(error, t.adminUsers.suspendError));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setActionLoading(id);
      await adminService.deleteUser(id);
      fetchData(activeFilter, search);
      toast.success(t.adminUsers.deleteSuccess);
    } catch (error) {
      toast.error(getErrorMessage(error, t.adminUsers.deleteError));
    } finally {
      setActionLoading(null);
    }
  };

  const usersColumns: DataTableColumn[] = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminUsers.colUser} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: t.adminUsers.colRole,
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === "ADMIN" ? "default" : row.original.role === "MODERATOR" ? "default" : "secondary"}
          className={
            row.original.role === "ADMIN"
              ? "bg-[#1a5c2a]"
              : row.original.role === "MODERATOR"
                ? "bg-blue-600"
                : ""
          }
        >
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "emailVerified",
      header: t.adminUsers.colEmailStatus,
      cell: ({ row }) => (
        <Badge
          variant={row.original.emailVerified ? "outline" : "secondary"}
          className={
            row.original.emailVerified
              ? "text-[#1a5c2a] border-[#1a5c2a]"
              : ""
          }
        >
          {row.original.emailVerified ? t.adminUsers.modalVerified : t.adminUsers.modalPending}
        </Badge>
      ),
    },
    {
      id: "registrations",
      header: t.adminUsers.colRegistrations,
      cell: ({ row }) => row.original._count.registrations.toLocaleString(dateLocale),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminUsers.colJoined} />,
      cell: ({ row }) => formatDate(row.original.createdAt, dateLocale),
    },
    {
      id: "actions",
      header: t.adminUsers.colActions,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => setSelectedUser(row.original)}
              disabled={actionLoading === row.original.id}
            >
              {t.adminUsers.viewProfile}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t.adminUsers.changeRole}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleRoleChange(row.original.id, "ADMIN")}
                disabled={actionLoading === row.original.id}
              >
                {t.adminUsers.makeAdmin}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange(row.original.id, "MODERATOR")}
                disabled={actionLoading === row.original.id}
              >
                {t.adminUsers.makeModerator}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange(row.original.id, "USER")}
                disabled={actionLoading === row.original.id}
              >
                {t.adminUsers.makeUser}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {!row.original.emailVerified && (
              <DropdownMenuItem
                onClick={() => handleVerifyUser(row.original.id)}
                disabled={actionLoading === row.original.id}
              >
                {t.adminUsers.verifyUser}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleSuspendUser(row.original.id)}
              disabled={actionLoading === row.original.id}
            >
              {row.original.suspended ? t.adminUsers.unsuspendUser : t.adminUsers.suspendUser}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                confirm({
                  title: t.adminUsers.deleteTitle,
                  description: t.adminUsers.deleteDesc.replace("{name}", row.original.name),
                  confirmLabel: t.adminUsers.deleteConfirm,
                  onConfirm: () => handleDeleteUser(row.original.id),
                })
              }
              disabled={actionLoading === row.original.id}
              className="text-red-600"
            >
              {t.adminUsers.deleteUser}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [t, dateLocale, actionLoading, confirm]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      {dialog}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminUsers.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.adminUsers.subtitle}
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total.toLocaleString(dateLocale)}</p>
              <p className="text-xs text-muted-foreground">{t.adminUsers.statsTotal}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c2a]">
                {stats.verified.toLocaleString(dateLocale)}
              </p>
              <p className="text-xs text-muted-foreground">{t.adminUsers.statsVerified}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.unverified.toLocaleString(dateLocale)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.adminUsers.statsUnverified}
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
            placeholder={t.adminUsers.searchPlaceholder}
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
            <EmptyState t={t} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={usersColumns}
              data={users}
              enablePagination
              enableSorting
              enableFiltering={false}
              pageSize={10}
            />
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
              <h2 className="text-lg font-bold">{t.adminUsers.modalTitle}</h2>
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
                  {t.adminUsers.modalRole}
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
                  {t.adminUsers.modalEmailStatus}
                </div>
                <Badge
                  variant={selectedUser.emailVerified ? "outline" : "secondary"}
                  className={
                    selectedUser.emailVerified
                      ? "text-[#1a5c2a] border-[#1a5c2a]"
                      : ""
                  }
                >
                  {selectedUser.emailVerified ? t.adminUsers.modalVerified : t.adminUsers.modalPending}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Ban className="h-4 w-4" />
                  {t.adminUsers.modalSuspended}
                </div>
                <Badge
                  variant={selectedUser.suspended ? "destructive" : "outline"}
                >
                  {selectedUser.suspended ? t.adminUsers.modalYes : t.adminUsers.modalNo}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {t.adminUsers.modalRegistrations}
                </div>
                <span className="text-sm font-medium">
                  {selectedUser._count.registrations}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t.adminUsers.modalMemberSince}
                </div>
                <span className="text-sm font-medium">
                  {formatDate(selectedUser.createdAt, dateLocale)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                {t.adminUsers.modalClose}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
