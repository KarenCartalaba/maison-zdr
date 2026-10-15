"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { newsService } from "@/services/news.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Newspaper, Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import { fetchWithOneRetry } from "@/lib/retry-fetch";
import { AuthorAvatar } from "@/components/features/news/author-avatar";
import type { News } from "@/types";

interface NewsDetailContentProps {
  initialNews: News | null;
  newsId?: string;
}

/** Settled result of the client fallback fetch, keyed by the id it was for. */
interface FetchedNews {
  id: string;
  news: News | null;
}

export default function NewsDetailContent({ initialNews, newsId }: NewsDetailContentProps) {
  const { t, dateLocale } = useLanguage();
  const [fetched, setFetched] = useState<FetchedNews | null>(null);

  // Client fallback when the server-side fetch returned nothing (404 or a
  // transient API failure) so a brief backend hiccup does not permanently
  // render "not found". `initialNews` and `newsId` are deps so a later SSR
  // payload or a route change cancels this request instead of racing it.
  useEffect(() => {
    if (initialNews || !newsId) return; // Already have SSR data / nothing to fetch with
    let active = true;

    // One automatic retry for transient failures (network blip or a single
    // rejection from the shared 401-refresh queue in services/axios.ts). The
    // promise settles only after the retry, so nothing is written between the
    // first rejection and a successful replay — no "Not Found" flash.
    fetchWithOneRetry(() => newsService.getById(newsId))
      .then((res) => {
        if (!active) return;
        setFetched({ id: newsId, news: res.data?.news ?? null });
      })
      .catch(() => {
        if (!active) return;
        setFetched({ id: newsId, news: null });
      });

    return () => {
      active = false;
    };
  }, [initialNews, newsId]);

  // Derived, never stored: the view is always in exactly one of three states —
  // fresh SSR data, in-flight skeleton, or a settled fetch result for THIS id.
  // Therefore "Not Found" requires a settled fetch with nothing to show; it
  // cannot appear while a request is in flight (a null SSR payload never
  // clears an already-rendered article either), and a retry resets it
  // automatically.
  const settled = fetched && newsId && fetched.id === newsId ? fetched : null;
  const news = initialNews ?? settled?.news ?? null;
  const loading = !initialNews && !!newsId && !settled;

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="mt-8 h-6 w-28" />
        <Skeleton className="mt-4 h-12 w-4/5" />
        <Skeleton className="mt-6 h-6 w-64" />
        <Skeleton className="mt-10 aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
        <Skeleton className="mt-8 h-4 w-full" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-3 h-4 w-3/4" />
      </div>
    );
  }

  // Reached only when loading === false (the branch above returned while any
  // request was in flight) — a settled fetch with nothing to show, i.e. a real
  // "not found", never a transient one.
  if (!news) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a5c2a]/10 ring-1 ring-[#1a5c2a]/15">
            <Newspaper className="h-8 w-8 text-[#1a5c2a]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t.news.newsNotFound}</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t.news.newsNotFoundDesc}
          </p>
          <Link href="/news" className="mt-8 inline-block">
            <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.news.backToNews}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Article header band */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-[#f2f8f4] to-transparent">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(26,92,42,0.12),transparent_55%)]"
        />
        <div className="container relative max-w-4xl mx-auto px-4 pt-8 pb-9 md:pt-12">
          <Link
            href="/news"
            className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-[#1a5c2a]/40 hover:text-[#1a5c2a]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.news.backToNews}
          </Link>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Badge className="bg-[#1a5c2a] text-white shadow-sm hover:bg-[#144a22]">
              {t.news.badge}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(news.createdAt, dateLocale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {news.title}
          </h1>

          {news.author && (
            <div className="mt-6 flex items-center gap-3">
              <AuthorAvatar name={news.author.name} className="h-9 w-9 text-sm" />
              <div className="leading-tight">
                <p className="text-sm font-semibold">{news.author.name}</p>
                <p className="text-xs text-muted-foreground">{t.news.byAuthor}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container max-w-4xl mx-auto px-4 py-10 md:py-12">
        {/* Cover */}
        {news.imageUrl && (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-foreground/10">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Summary callout */}
        {news.summary && (
          <aside className="mb-10 rounded-2xl border-l-4 border-[#1a5c2a] bg-[#f2f8f4] p-6 ring-1 ring-[#1a5c2a]/10">
            <Quote className="mb-2 h-5 w-5 text-[#1a5c2a]/70" aria-hidden="true" />
            <p className="text-lg leading-relaxed text-foreground/80">{news.summary}</p>
          </aside>
        )}

        {/* Content */}
        <article className="space-y-5 text-[17px] leading-relaxed text-foreground/90">
          {news.content.split("\n").map((paragraph, index) =>
            paragraph.trim() ? <p key={index}>{paragraph}</p> : null
          )}
        </article>

        {/* Footer */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <span className="text-sm text-muted-foreground">
            {formatDate(news.createdAt, dateLocale, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <Link href="/news">
            <Button className="bg-[#1a5c2a] hover:bg-[#144a22]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.news.backToNews}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
