"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { newsService } from "@/services/news.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Newspaper } from "lucide-react";
import type { News } from "@/types";

interface NewsDetailContentProps {
  initialNews: News | null;
}

export default function NewsDetailContent({ initialNews }: NewsDetailContentProps) {
  const [news, setNews] = useState<News | null>(initialNews);
  const [loading, setLoading] = useState(!initialNews);

  useEffect(() => {
    if (initialNews) return;
    // If no SSR data, we can't fetch without knowing the ID from URL
    // This is handled by the server component above
    setLoading(false);
  }, [initialNews]);

  if (loading) {
    return (
      <div className="container px-4 py-12 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container px-4 py-12 max-w-4xl mx-auto text-center">
        <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">News Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The news article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/news">
          <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/news"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to News
      </Link>

      {/* Header */}
      <div className="mb-8">
        <Badge className="mb-4 bg-[#1a5c2a] hover:bg-[#144a22]">News</Badge>
        <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(news.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {news.author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{news.author.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      {news.imageUrl && (
        <div className="relative h-96 rounded-lg overflow-hidden mb-8">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Summary */}
      {news.summary && (
        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <p className="text-lg text-muted-foreground italic">{news.summary}</p>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {news.content.split("\n").map((paragraph, index) => (
          paragraph.trim() && (
            <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
              {paragraph}
            </p>
          )
        ))}
      </div>

      {/* Footer */}
      <div className="border-t mt-12 pt-8">
        <Link href="/news">
          <Button variant="outline" className="border-[#1a5c2a] text-[#1a5c2a] hover:bg-[#1a5c2a] hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All News
          </Button>
        </Link>
      </div>
    </div>
  );
}
