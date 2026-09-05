import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-9 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-56 mb-4" />
            <Skeleton className="h-[250px] w-full rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex justify-center mb-4">
              <Skeleton className="h-[180px] w-[180px] rounded-full" />
            </div>
            <Skeleton className="h-8 w-20 mx-auto mb-1" />
            <Skeleton className="h-4 w-28 mx-auto mb-4" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-[250px] w-full rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-28 mb-4" />
            <Skeleton className="h-[250px] w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
