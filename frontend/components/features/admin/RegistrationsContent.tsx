"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Download, Search } from "lucide-react";

const mockRegistrations = [
  { id: "1", ref: "MZ-8F4A21", name: "Amara Villanueva", email: "amara.v@gmail.com", event: "Acoustic Friday", date: "Oct 26, 21:30", status: "CONFIRMED", hasPlusOne: true },
  { id: "2", ref: "MZ-8F4A22", name: "Noel Baptiste", email: "noel.baptiste@gmail.com", event: "Acoustic Friday", date: "Oct 26, 21:30", status: "CONFIRMED", hasPlusOne: false },
  { id: "3", ref: "MZ-8F4A23", name: "Priya Raghavan", email: "priya.r@gmail.com", event: "Cocktail Night", date: "Oct 28, 20:00", status: "PENDING", hasPlusOne: false },
  { id: "4", ref: "MZ-8F4A24", name: "Tomasz Krol", email: "tomasz.k@gmail.com", event: "Trivia Hour", date: "Nov 01, 19:00", status: "WAITLISTED", hasPlusOne: true },
  { id: "5", ref: "MZ-8F4A25", name: "Keiko Tanaka", email: "keiko.t@gmail.com", event: "Acoustic Friday", date: "Oct 26, 21:30", status: "CANCELLED", hasPlusOne: false },
];

export default function RegistrationsContent() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Registrations</h1>
          <p className="text-sm text-muted-foreground">Manage all event registrations</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search registrations..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {["All", "Confirmed", "Pending", "Waitlisted", "Cancelled"].map((filter) => (
            <Button key={filter} variant="outline" size="sm">{filter}</Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">1,890</p>
            <p className="text-xs text-muted-foreground">Total Registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a5c2a]">1,428</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">264</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">86</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
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
                {mockRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-3 font-mono font-medium">{reg.ref}</td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-medium">{reg.name}</p>
                        <p className="text-xs text-muted-foreground">{reg.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{reg.event}</td>
                    <td className="px-6 py-3 text-muted-foreground">{reg.date}</td>
                    <td className="px-6 py-3 text-muted-foreground">{reg.hasPlusOne ? "Yes" : "No"}</td>
                    <td className="px-6 py-3">
                      <Badge variant={reg.status === "CONFIRMED" ? "outline" : reg.status === "CANCELLED" ? "destructive" : "secondary"}
                        className={reg.status === "CONFIRMED" ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
                        {reg.status}
                      </Badge>
                    </td>
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
