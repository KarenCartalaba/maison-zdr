import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar } from "lucide-react";
import type { News } from "@/types";

interface NewsSectionProps {
  news?: News[];
}

export default function NewsSection({ news = [] }: NewsSectionProps) {
  if (news.length === 0) return null;

  return (
    <section className="container px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">News & Updates</h2>
          <p className="text-muted-foreground mt-1">
            Stay informed with the latest announcements
          </p>
        </div>
        <Link href="/news" className="text-sm font-medium text-[#1a5c2a] hover:underline">
          View All &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.slice(0, 3).map((item) => (
          <Link key={item.id} href={`/news/${item.id}`}>
            <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="relative h-48 bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9]">
                    <Newspaper className="h-16 w-16 text-[#1a5c2a] opacity-40" />
                  </div>
                )}
                <Badge className="absolute top-3 right-3 bg-[#1a5c2a] hover:bg-[#144a22]">
                  News
                </Badge>
              </div>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                {item.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
