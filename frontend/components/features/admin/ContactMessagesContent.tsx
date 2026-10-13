"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Inbox, Loader2, Mail, Search } from "lucide-react";
import axiosInstance from "@/services/axios";
import { API_ENDPOINTS } from "@/constants";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import type { ApiResponse, ContactMessage } from "@/types";

const RECEIVED_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function LoadingSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-56 bg-muted rounded mb-2" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>
      </div>
      <div className="mb-6">
        <div className="h-10 w-full max-w-sm bg-muted rounded-lg" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="flex-1">
                  <div className="h-4 w-40 bg-muted rounded mb-2" />
                  <div className="h-3 w-56 bg-muted rounded" />
                </div>
                <div className="h-5 w-32 bg-muted rounded-full shrink-0" />
              </div>
              <div className="h-16 bg-muted rounded" />
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
      <h3 className="text-lg font-medium mb-1">{t.adminContact.emptyTitle}</h3>
      <p className="text-sm text-muted-foreground">{t.adminContact.emptyDesc}</p>
    </div>
  );
}

export default function ContactMessagesContent() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t, dateLocale } = useLanguage();

  const fetchMessages = async (searchTerm?: string, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
      const response = await axiosInstance.get<ApiResponse<{ messages: ContactMessage[] }>>(
        `${API_ENDPOINTS.CONTACT.ADMIN_LIST}${query}`
      );
      if (response.data?.data) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
      toast.error(t.adminContact.loadError);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchMessages(undefined, true);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchMessages(value);
    }, 400);
  };

  if (loading && messages.length === 0) return <LoadingSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminContact.title}</h1>
          <p className="text-sm text-muted-foreground">{t.adminContact.subtitle}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.adminContact.searchPlaceholder}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 bg-transparent outline-none w-full"
          />
          {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Messages list */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState t={t} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="font-medium truncate">{message.name}</p>
                    </div>
                    <a
                      href={`mailto:${message.email}`}
                      className="text-xs text-muted-foreground hover:text-[#1a5c2a] break-all"
                    >
                      {message.email}
                    </a>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground shrink-0">
                    {formatDate(message.createdAt, dateLocale, RECEIVED_OPTIONS)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {message.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
