"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Search, MessageSquare } from "lucide-react";

const mockReviews = [
  { id: "1", user: "Amara Villanueva", event: "Acoustic Friday", rating: 5, title: "Amazing Night!", comment: "The live music was incredible. Great atmosphere and friendly staff. Will definitely come back!", date: "Oct 27, 2026", status: "APPROVED" },
  { id: "2", user: "Noel Baptiste", event: "Acoustic Friday", rating: 4, title: "Great Vibes", comment: "Really enjoyed the acoustics and the cocktails. The only downside was the wait time at the bar.", date: "Oct 27, 2026", status: "APPROVED" },
  { id: "3", user: "Priya Raghavan", event: "Cocktail Night", rating: 5, title: "Perfect Evening", comment: "The cocktail masterclass was so much fun. Learned a lot and met great people.", date: "Oct 29, 2026", status: "PENDING" },
  { id: "4", user: "Tomasz Krol", event: "Trivia Hour", rating: 3, title: "Fun but Crowded", comment: "The trivia questions were fun but it was way too crowded. Hard to hear the host.", date: "Nov 02, 2026", status: "PENDING" },
];

export default function ReviewsContent() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">Manage guest reviews and feedback</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">4.6</p>
            <div className="flex justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= 4 ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">248</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#1a5c2a]">12</p>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">89%</p>
            <p className="text-xs text-muted-foreground">Positive Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search reviews..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <div className="flex gap-2">
          {["All", "Pending", "Approved", "Flagged"].map((filter) => (
            <Button key={filter} variant="outline" size="sm">{filter}</Button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{review.user}</p>
                    <Badge variant={review.status === "APPROVED" ? "outline" : "secondary"}
                      className={review.status === "APPROVED" ? "text-[#1a5c2a] border-[#1a5c2a]" : ""}>
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.event} · {review.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                  ))}
                </div>
              </div>
              <h4 className="font-medium mb-1">{review.title}</h4>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              <div className="flex gap-2 mt-4">
                {review.status === "PENDING" && (
                  <>
                    <Button variant="outline" size="sm" className="text-[#1a5c2a] border-[#1a5c2a]">Approve</Button>
                    <Button variant="outline" size="sm" className="text-red-500 border-red-500">Reject</Button>
                  </>
                )}
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
