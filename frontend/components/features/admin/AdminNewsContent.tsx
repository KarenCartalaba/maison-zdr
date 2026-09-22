"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { newsService, CreateNewsData } from "@/services/news.service";
import { getErrorMessage, getFieldErrors } from "@/lib/server-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useLanguage } from "@/context/LanguageContext";
import { formatDate } from "@/lib/format-date";
import type { News } from "@/types";
import { z } from "zod";

const newsContentSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
  content: z.string().min(1, "Content is required").max(10000, "Content must be at most 10000 characters"),
});

interface AdminNewsContentProps {
  initialNews?: any[];
}

export default function AdminNewsContent({ initialNews = [] }: AdminNewsContentProps) {
  const [news, setNews] = useState<News[]>(initialNews);
  const [isLoading, setIsLoading] = useState(initialNews.length === 0);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { t, dateLocale } = useLanguage();

  // Form state
  const [formData, setFormData] = useState<CreateNewsData>({
    title: "",
    content: "",
    summary: "",
    imageUrl: "",
    isPublished: true,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { confirm, dialog } = useConfirm();

  const updateField = (field: keyof CreateNewsData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    newsService
      .getAll()
      .then((res) => {
        if (res.data) setNews(res.data.news);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      imageUrl: "",
      isPublished: true,
    });
    setFieldErrors({});
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) return;
    setFieldErrors({});
    try {
      const response = await newsService.create(formData);
      if (response.code === 201 && response.data) {
        setNews([response.data.news, ...news]);
        resetForm();
        toast.success(t.adminNews.createSuccess);
      } else {
        toast.error(response.message || t.adminNews.createError);
      }
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      toast.error(getErrorMessage(err, t.adminNews.createError));
    }
  };

  const handleEdit = (item: News) => {
    setEditingId(item.id);
    setIsCreating(false);
    setFormData({
      title: item.title,
      content: item.content,
      summary: item.summary || "",
      imageUrl: item.imageUrl || "",
      isPublished: item.isPublished,
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.title || !formData.content) return;
    setFieldErrors({});
    try {
      const response = await newsService.update({ id: editingId, ...formData });
      if (response.code === 200 && response.data) {
        setNews(news.map((n) => (n.id === editingId ? response.data!.news : n)));
        resetForm();
        toast.success(t.adminNews.updateSuccess);
      } else {
        toast.error(response.message || t.adminNews.updateError);
      }
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      toast.error(getErrorMessage(err, t.adminNews.updateError));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await newsService.delete(id);
      if (response.code === 200) {
        setNews(news.filter((n) => n.id !== id));
        toast.success(t.adminNews.deleteSuccess);
      } else {
        toast.error(response.message || t.adminNews.deleteError);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, t.adminNews.deleteError));
    }
  };

  // TanStack Table columns
  const newsColumns: DataTableColumn[] = useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t.adminNews.colTitle} />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      id: "author",
      header: t.adminNews.colAuthor,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.author?.name || "Unknown"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: t.adminNews.colCreated,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.createdAt, dateLocale, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "status",
      header: t.adminNews.colStatus,
      cell: ({ row }) => (
        <Badge
          variant={row.original.isPublished ? "outline" : "secondary"}
          className={
            row.original.isPublished
              ? "text-[#1a5c2a] border-[#1a5c2a]"
              : "text-muted-foreground"
          }
        >
          {row.original.isPublished ? t.adminNews.published : t.adminNews.draft}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: t.adminNews.colActions,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              confirm({
                title: t.adminNews.deleteTitle,
                description: t.adminNews.deleteDesc.replace("{title}", row.original.title),
                confirmLabel: t.adminNews.deleteConfirm,
                onConfirm: () => handleDelete(row.original.id),
              })
            }
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      ),
    },
  ], [t, dateLocale, confirm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {dialog}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t.adminNews.title}</h1>
          <p className="text-sm text-muted-foreground">{t.adminNews.subtitle}</p>
        </div>
        {!isCreating && !editingId && (
          <Button
            className="bg-[#1a5c2a] hover:bg-[#144a22]"
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
              setFormData({
                title: "",
                content: "",
                summary: "",
                imageUrl: "",
                isPublished: true,
              });
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.adminNews.createNew}
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {(isCreating || editingId) && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? t.adminNews.editTitle : t.adminNews.createTitle}
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t.adminNews.labelTitle}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder={t.adminNews.placeholderTitle}
                  maxLength={100}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
                {fieldErrors.title && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.title}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.adminNews.labelSummary}</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  placeholder={t.adminNews.placeholderSummary}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
                {fieldErrors.summary && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.summary}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.adminNews.labelContent}</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  placeholder={t.adminNews.placeholderContent}
                  rows={8}
                  maxLength={10000}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
                {fieldErrors.content && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.content}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t.adminNews.labelImageUrl}</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder={t.adminNews.placeholderImageUrl}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
                {fieldErrors.imageUrl && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.imageUrl}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isPublished" className="text-sm font-medium">
                  {t.adminNews.labelPublished}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-[#1a5c2a] hover:bg-[#144a22]"
                  onClick={editingId ? handleUpdate : handleCreate}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? t.adminNews.btnUpdate : t.adminNews.btnCreate}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  {t.adminNews.btnCancel}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Table */}
      <Card>
        <CardContent className="p-0">
          {news.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              {t.adminNews.noNews}
            </div>
          ) : (
            <DataTable columns={newsColumns} data={news} enablePagination enableSorting pageSize={10} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
