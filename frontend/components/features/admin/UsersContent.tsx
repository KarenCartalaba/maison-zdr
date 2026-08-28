"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Shield, User, Mail } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Amara Villanueva", email: "amara.v@gmail.com", role: "USER", emailVerified: true, registrations: 5, joined: "Jan 15, 2025" },
  { id: "2", name: "Noel Baptiste", email: "noel.baptiste@gmail.com", role: "USER", emailVerified: true, registrations: 3, joined: "Feb 20, 2025" },
  { id: "3", name: "Priya Raghavan", email: "priya.r@gmail.com", role: "USER", emailVerified: false, registrations: 1, joined: "Mar 10, 2025" },
  { id: "4", name: "Tomasz Krol", email: "tomasz.k@gmail.com", role: "ADMIN", emailVerified: true, registrations: 0, joined: "Jan 01, 2025" },
  { id: "5", name: "Keiko Tanaka", email: "keiko.t@gmail.com", role: "USER", emailVerified: true, registrations: 8, joined: "Dec 05, 2024" },
];

export default function AdminUsersContent() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts and roles</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">1,240</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a5c2a]">1,180</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">60</p>
            <p className="text-xs text-muted-foreground">Pending Verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search users..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {["All", "Admin", "Verified", "Unverified"].map((filter) => (
            <Button key={filter} variant="outline" size="sm">{filter}</Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
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
                {mockUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}
                        className={u.role === "ADMIN" ? "bg-[#1a5c2a]" : ""}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={u.emailVerified ? "outline" : "secondary"}
                        className={u.emailVerified ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
                        {u.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{u.registrations}</td>
                    <td className="px-6 py-3 text-muted-foreground">{u.joined}</td>
                    <td className="px-6 py-3">
                      <Button variant="ghost" size="sm">···</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
