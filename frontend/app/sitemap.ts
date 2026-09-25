import type { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.maison-zdr.online").replace(/\/+$/, "");
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

interface EventItem {
  id: string;
  updatedAt?: string;
  createdAt?: string;
}

interface NewsItem {
  id: string;
  updatedAt?: string;
  createdAt?: string;
}

async function fetchIds(path: string): Promise<{ id: string; lastModified?: string }[]> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items: (EventItem | NewsItem)[] =
      json?.data?.events ?? json?.data?.news ?? json?.data ?? [];
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => typeof item?.id === "string")
      .map((item) => ({
        id: item.id,
        lastModified: item.updatedAt ?? item.createdAt,
      }));
  } catch {
    // Backend unreachable (e.g. local build without API) — fall back to static URLs only
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news] = await Promise.all([
    fetchIds("/api/events/v1/all"),
    fetchIds("/api/news/v1/all"),
  ]);

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...events.map((event) => ({
      url: `${BASE_URL}/events/${event.id}`,
      lastModified: event.lastModified ? new Date(event.lastModified) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...news.map((item) => ({
      url: `${BASE_URL}/news/${item.id}`,
      lastModified: item.lastModified ? new Date(item.lastModified) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
