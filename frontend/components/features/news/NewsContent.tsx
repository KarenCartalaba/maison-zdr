"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { newsService } from "@/services/news.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import { AuthorAvatar } from "@/components/features/news/author-avatar";
import type { News } from "@/types";

type NewsDict = ReturnType<typeof useLanguage>["t"];

interface NewsContentProps {
  initialNews?: News[];
}

/** First non-empty paragraph, trimmed — used as the featured excerpt. */
function excerptOf(item: News, max = 220): string {
  const source = item.summary?.trim() || item.content;
  const paragraph =
    source
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "";
  return paragraph.length > max ? `${paragraph.slice(0, max).trimEnd()}…` : paragraph;
}

/** Calendar-date chip layered on the cover imagery. */
function DateChip({ date, dateLocale }: { date: string; dateLocale: string }) {
  const value = new Date(date);
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-col items-center rounded-xl bg-white/95 px-3 py-1.5 text-center shadow-md ring-1 ring-black/5">
      <span className="text-lg font-bold leading-none text-[#1a5c2a]">
        {value.toLocaleDateString(dateLocale, { day: "2-digit" })}
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1a5c2a]/70">
        {value.toLocaleDateString(dateLocale, { month: "short" })}
      </span>
    </div>
  );
}

/** Cover image, or the branded placeholder when the article has none. */
function Cover({ item }: { item: News }) {
  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8f5e9] via-[#d7edcf] to-[#c8e6c9]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
        <Newspaper className="h-8 w-8 text-[#1a5c2a] opacity-70" />
      </div>
    </div>
  );
}

function NewsCard({
  item,
  t,
  dateLocale,
}: {
  item: News;
  t: NewsDict;
  dateLocale: string;
}) {
  return (
    <Card className="group h-full gap-0 overflow-hidden rounded-2xl border-border/70 p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1a5c2a]/40 hover:shadow-lg hover:shadow-[#1a5c2a]/10">
      <Link
        href={`/news/${item.id}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a] focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Cover item={item} />
          <DateChip date={item.createdAt} dateLocale={dateLocale} />
          <Badge className="absolute right-3 top-3 bg-[#1a5c2a] text-white shadow-md hover:bg-[#144a22]">
            {t.news.badge}
          </Badge>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-[#1a5c2a]">
            {item.title}
          </h3>
          {item.summary && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {item.summary}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2">
              <AuthorAvatar name={item.author?.name} className="h-6 w-6 text-[10px]" />
              <span className="truncate">
                {t.news.byAuthor} {item.author?.name}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[#1a5c2a]">
              {t.news.readMore}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function FeaturedNewsCard({
  item,
  t,
  dateLocale,
}: {
  item: News;
  t: NewsDict;
  dateLocale: string;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-[#1a5c2a]/25 bg-gradient-to-br from-[#f2f8f4] to-card p-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#1a5c2a]/50 hover:shadow-lg hover:shadow-[#1a5c2a]/10 sm:col-span-2 lg:col-span-3">
      <Link
        href={`/news/${item.id}`}
        className="group grid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a] focus-visible:ring-offset-2 md:grid-cols-2"
      >
        <div className="relative h-56 overflow-hidden bg-muted sm:h-64 md:h-auto md:min-h-[320px]">
          <Cover item={item} />
          <DateChip date={item.createdAt} dateLocale={dateLocale} />
          <Badge className="absolute right-3 top-3 bg-[#1a5c2a] text-white shadow-md hover:bg-[#144a22]">
            {t.news.badge}
          </Badge>
        </div>

        <CardContent className="flex flex-col justify-center gap-4 p-6 md:p-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#1a5c2a]/25 bg-[#1a5c2a]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1a5c2a]">
            <Sparkles className="h-3 w-3" />
            {t.news.badge}
          </span>

          <h3 className="text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-[#1a5c2a] md:text-3xl">
            {item.title}
          </h3>

          <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">
            {excerptOf(item)}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex min-w-0 items-center gap-2">
              <AuthorAvatar name={item.author?.name} />
              <span className="truncate">
                {t.news.byAuthor} {item.author?.name}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(item.createdAt, dateLocale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <span className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#1a5c2a]">
            {t.news.readMore}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}

function NewsSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm sm:col-span-2 lg:col-span-3">
        <div className="grid md:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-none sm:h-64 md:h-full md:min-h-[320px]" />
          <div className="space-y-4 p-6 md:p-8">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between border-t border-border/70 pt-4">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsContent({ initialNews = [] }: NewsContentProps) {
  const { t, dateLocale } = useLanguage();
  const [news, setNews] = useState<News[]>(initialNews);
  const [loading, setLoading] = useState(initialNews.length === 0);

  // Always reflect the latest server data (e.g. after a delete + refresh)
  useEffect(() => {
    setNews(initialNews);
    if (initialNews.length > 0) setLoading(false);
  }, [initialNews]);

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

  const [featured, ...rest] = news;

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a5c2a] via-[#1f7134] to-[#2d8a42] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-16 -bottom-24 h-80 w-80 rounded-full bg-[#86efac]/25 blur-3xl" />
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        <div className="container relative px-4 py-16 text-center md:py-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur">
            <Newspaper className="h-3.5 w-3.5" />
            {t.news.badge}
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            {t.news.heroTitle}
          </h1>
          <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-white/70" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            {t.news.heroSubtitle}
          </p>
        </div>
      </section>

      {/* News Grid */}
      <div className="container px-4 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-border pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1a5c2a]">
              {t.news.badge}
            </span>
            <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              {t.news.latestNews}
            </h2>
          </div>
          <span aria-hidden="true" className="hidden h-px flex-1 bg-border md:block" />
        </div>

        {loading ? (
          <NewsSkeletons />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured && (
              <FeaturedNewsCard item={featured} t={t} dateLocale={dateLocale} />
            )}
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} t={t} dateLocale={dateLocale} />
            ))}
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5c2a]/10 ring-1 ring-[#1a5c2a]/15">
              <Newspaper className="h-7 w-7 text-[#1a5c2a]" />
            </div>
            <p className="text-base font-medium">{t.news.noNewsAvailable}</p>
          </div>
        )}
      </div>
    </>
  );
}
