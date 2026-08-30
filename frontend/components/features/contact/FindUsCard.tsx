import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FindUsCard() {
  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle>Find Us</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Replace with actual Google Maps embed or interactive map */}
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src="/images/map.png"
            alt="Map showing our location"
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}
