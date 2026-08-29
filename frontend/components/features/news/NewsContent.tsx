"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { newsService } from "@/services/news.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Calendar } from "lucide-react";
import type { News } from "@/types";

interface NewsContentProps {
  initialNews?: News[];
}

export default function NewsContent({ initialNews = [] }: NewsContentProps) {
  const [news, setNews] = useState<News[]>(initialNews);
  const [loading, setLoading] = useState(initialNews.length === 0);

  useEffect(() => {
    if (initialNews.length > 0) return;
    newsService
      .getAll()
      .then((res) => {
        if (res.data) setNews(res.data.news);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialNews.length]);

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#1a5c2a] to-[#2d8a42] text-white py-16">
        <div className="container px-4 text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">News & Updates</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Stay informed with the latest announcements, events, and updates from Maison ZDR.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <div className="container px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Latest News</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item) => (
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
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {item.author && (
                      <p className="text-xs text-muted-foreground">
                        By {item.author.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {!loading && news.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No news articles available yet.
          </p>
        )}
      </div>
    </>
  );
}
