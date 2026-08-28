import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactInfoCard() {
  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">Contact Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <MapPin className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Location</h4>
            <p className="text-sm text-muted-foreground">
              9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes, France
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <Phone className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Phone</h4>
            <p className="text-sm text-muted-foreground">09123456789</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <Mail className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Email</h4>
            <p className="text-sm text-muted-foreground">maisonzdr@gmail.com</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a5c2a]/10">
            <Clock className="h-5 w-5 text-[#1a5c2a]" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Operation Time</h4>
            <p className="text-sm text-muted-foreground">Mon-Sun: 10:00 - 23:00</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
