"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Search, CheckCircle2, Clock, User } from "lucide-react";

const mockCheckIns = [
  { id: "1", name: "Amara Villanueva", email: "amara.v@gmail.com", event: "Acoustic Friday", checkedIn: true, time: "20:45", tableNumber: "T4" },
  { id: "2", name: "Noel Baptiste", email: "noel.baptiste@gmail.com", event: "Acoustic Friday", checkedIn: true, time: "20:52", tableNumber: "T7" },
  { id: "3", name: "Priya Raghavan", email: "priya.r@gmail.com", event: "Acoustic Friday", checkedIn: false, time: null, tableNumber: null },
  { id: "4", name: "Tomasz Krol", email: "tomasz.k@gmail.com", event: "Acoustic Friday", checkedIn: false, time: null, tableNumber: null },
];

export default function CheckInsContent() {
  const [scanMode, setScanMode] = useState(false);
  const checkedInCount = mockCheckIns.filter((c) => c.checkedIn).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Check-in Desk</h1>
          <p className="text-sm text-muted-foreground">Scan QR code or manually check in participants</p>
        </div>
        <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">180</p>
            <p className="text-xs text-muted-foreground">Expected Guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a5c2a]">{checkedInCount}</p>
            <p className="text-xs text-muted-foreground">Checked In</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{180 - checkedInCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-6 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Search by name or reference..." className="bg-transparent text-sm outline-none w-full" />
      </div>

      {/* Check-in List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acoustic Friday — Check-in List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">GUEST</th>
                  <th className="px-6 py-3 font-medium">STATUS</th>
                  <th className="px-6 py-3 font-medium">CHECK-IN TIME</th>
                  <th className="px-6 py-3 font-medium">TABLE</th>
                  <th className="px-6 py-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mockCheckIns.map((guest) => (
                  <tr key={guest.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{guest.name}</p>
                          <p className="text-xs text-muted-foreground">{guest.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={guest.checkedIn ? "outline" : "secondary"}
                        className={guest.checkedIn ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
                        {guest.checkedIn ? "Checked In" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{guest.time || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{guest.tableNumber || "—"}</td>
                    <td className="px-6 py-3">
                      {!guest.checkedIn && (
                        <Button variant="outline" size="sm" className="text-[#1a5c2a] border-[#1a5c2a]">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
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
