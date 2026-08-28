"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, MessageSquare, Inbox } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AdminReview, ReviewStats } from "@/types";

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-1">No reviews found</h3>
      <p className="text-sm text-muted-foreground">
        There are no reviews matching your criteria.
      </p>
    </div>
  );
}

export default function ReviewsContent() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async (status?: string, searchTerm?: string) => {
    try {
      setLoading(true);
      const response = await adminService.getReviews({
        status: status !== "ALL" ? status : undefined,
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
    }
  };

  useEffect(() => {
    fetchData(activeFilter, search);
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchData(filter, search);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchData(activeFilter, value);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setActionLoading(id);
      await adminService.updateReviewStatus(id, status);
      fetchData(activeFilter, search);
    } catch (error) {
      console.error("Failed to update review status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      setActionLoading(id);
      await adminService.replyToReview(id, replyText);
      setReplyingId(null);
      setReplyText("");
      fetchData(activeFilter, search);
    } catch (error) {
      console.error("Failed to reply:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  const positivePercentage =
    stats && stats.total > 0
      ? Math.round((stats.approved / stats.total) * 100)
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Manage guest reviews and feedback
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
                Average Rating
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-[#1a5c2a]">
                {stats.pending}
              </p>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{positivePercentage}%</p>
              <p className="text-xs text-muted-foreground">
                Positive Reviews
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 bg-transparent outline-none w-full"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(filter)}
              className={
                activeFilter === filter ? "bg-[#1a5c2a] hover:bg-[#144a22]" : ""
              }
            >
              {filter.charAt(0) + filter.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
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
                      {review.event.title} · {formatDate(review.createdAt)}
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
                      Reply:
                    </p>
                    <p className="text-sm">{review.reply}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {review.status === "PENDING" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#1a5c2a] border-[#1a5c2a]"
                        onClick={() =>
                          handleStatusChange(review.id, "APPROVED")
                        }
                        disabled={actionLoading === review.id}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-500"
                        onClick={() =>
                          handleStatusChange(review.id, "REJECTED")
                        }
                        disabled={actionLoading === review.id}
                      >
                        Reject
                      </Button>
                    </>
                  )}
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
                    {review.reply ? "Edit Reply" : "Reply"}
                  </Button>
                </div>
                {replyingId === review.id && (
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Write your reply..."
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
                      {actionLoading === review.id ? "Sending..." : "Send"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingId(null);
                        setReplyText("");
                      }}
                    >
                      Cancel
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
