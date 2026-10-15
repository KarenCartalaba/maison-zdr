"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/server-error";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, MessageSquare, Inbox, Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import type { AdminReview, ReviewStats } from "@/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-8 w-16 bg-muted rounded mx-auto mb-2" />
              <div className="h-3 w-24 bg-muted rounded mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ t }: { t: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">{t.adminReviews.emptyTitle}</h3>
      <p className="text-sm text-muted-foreground">
        {t.adminReviews.emptyDesc}
      </p>
    </div>
  );
}

interface ReviewsContentProps {
  initialReviews?: AdminReview[] | null;
  initialStats?: ReviewStats | null;
}

export default function ReviewsContent({
  initialReviews = null,
  initialStats = null,
}: ReviewsContentProps) {
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews ?? []);
  const [stats, setStats] = useState<ReviewStats | null>(initialStats);
  const [loading, setLoading] = useState(!initialReviews);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t, dateLocale } = useLanguage();

  const fetchData = async (searchTerm?: string, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      const response = await adminService.getReviews({
        search: searchTerm || undefined,
      });
      if (response.data) {
        setReviews(response.data.reviews);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    // Skip the client fetch when the page already provided server-rendered data.
    if (initialReviews) {
      setLoading(false);
      return;
    }
    fetchData(search, true);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [initialReviews]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchData(value);
    }, 400);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      setActionLoading(id);
      await adminService.replyToReview(id, replyText);
      setReplyingId(null);
      setReplyText("");
      fetchData(search);
      toast.success("Reply sent");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send reply"));
    } finally {
      setActionLoading(null);
    }
  };

  // Event filter list + narrowed rows: the admin review payload already
  // carries event.id / event.title, so filtering needs no extra round trip.
  const uniqueEvents = useMemo(
    () =>
      Array.from(
        new Map(reviews.map((review) => [review.event.id, review.event])).values()
      ),
    [reviews]
  );

  const filteredReviews =
    eventFilter === "ALL"
      ? reviews
      : reviews.filter((review) => review.event.id === eventFilter);

  if (loading && reviews.length === 0) return <LoadingSkeleton />;

  const positivePercentage =
    stats && stats.total > 0
      ? Math.round((stats.approved / stats.total) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminReviews.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.adminReviews.subtitle}
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {stats.avgRating.toFixed(1)}
              </p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(stats.avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.adminReviews.statsAvgRating}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total.toLocaleString(dateLocale)}</p>
              <p className="text-xs text-muted-foreground">{t.adminReviews.statsTotal}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c2a]">
                {stats.pending.toLocaleString(dateLocale)}
              </p>
              <p className="text-xs text-muted-foreground">{t.adminReviews.statsPending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{positivePercentage}%</p>
              <p className="text-xs text-muted-foreground">
                {t.adminReviews.statsPositive}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.adminReviews.searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 bg-transparent outline-none w-full"
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {/* Same event select pattern as the Registrations toolbar. */}
        <div className="flex gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="ALL">{t.adminReviews.allEvents}</option>
            {uniqueEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState t={t} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{review.user.name}</p>
                      <Badge
                        variant={
                          review.status === "APPROVED"
                            ? "outline"
                            : review.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          review.status === "APPROVED"
                            ? "text-[#1a5c2a] border-[#1a5c2a]"
                            : ""
                        }
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.event.title} · {formatDate(review.createdAt, dateLocale)}
                    </p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.title && (
                  <h4 className="font-medium mb-1">{review.title}</h4>
                )}
                <p className="text-sm text-muted-foreground">
                  {review.comment}
                </p>
                {review.reply && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t.adminReviews.replyLabel}
                    </p>
                    <p className="text-sm">{review.reply}</p>
                  </div>
                )}
                {review.removalReason && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t.adminReviews.removalReasonLabel}
                    </p>
                    <p className="text-sm">{review.removalReason}</p>
                  </div>
                )}
                {/* Reviews are published automatically on submission and are never taken
                    down — genuine negative feedback always stays visible. */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingId(
                        replyingId === review.id ? null : review.id
                      );
                      setReplyText(review.reply || "");
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {review.reply ? t.adminReviews.editReply : t.adminReviews.reply}
                  </Button>
                </div>
                {replyingId === review.id && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder={t.adminReviews.writeReply}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      className="bg-[#1a5c2a] hover:bg-[#144a22]"
                      onClick={() => handleReply(review.id)}
                      disabled={
                        actionLoading === review.id || !replyText.trim()
                      }
                    >
                      {actionLoading === review.id ? t.adminReviews.sending : t.adminReviews.send}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingId(null);
                        setReplyText("");
                      }}
                    >
                      {t.adminReviews.cancel}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
