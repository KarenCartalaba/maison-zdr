"use client";

import { useEffect, useState } from "react";
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
import type { News } from "@/types";

interface AdminNewsContentProps {
  initialNews?: any[];
}

export default function AdminNewsContent({ initialNews = [] }: AdminNewsContentProps) {
  const [news, setNews] = useState<News[]>(initialNews);
  const [isLoading, setIsLoading] = useState(initialNews.length === 0);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    // Clear this field's server error as the user retypes
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
        toast.success("Article created successfully");
      } else {
        toast.error(response.message || "Failed to create article");
      }
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      toast.error(getErrorMessage(err, "Failed to create article"));
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
        toast.success("Article updated successfully");
      } else {
        toast.error(response.message || "Failed to update article");
      }
    } catch (err) {
      const errors = getFieldErrors(err);
      setFieldErrors(errors);
      toast.error(getErrorMessage(err, "Failed to update article"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await newsService.delete(id);
      if (response.code === 200) {
        setNews(news.filter((n) => n.id !== id));
        toast.success("Article deleted");
      } else {
        toast.error(response.message || "Failed to delete article");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete article"));
    }
  };

  // TanStack Table columns
  const newsColumns: DataTableColumn[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="TITLE" />,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      id: "author",
      header: "AUTHOR",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.author?.name || "Unknown"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "CREATED",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "status",
      header: "STATUS",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isPublished ? "outline" : "secondary"}
          className={
            row.original.isPublished
              ? "text-[#1a5c2a] border-[#1a5c2a]"
              : "text-muted-foreground"
          }
        >
          {row.original.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "ACTIONS",
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
                title: "Delete article",
                description: `Permanently delete "${row.original.title}"? This action cannot be undone.`,
                confirmLabel: "Delete",
                onConfirm: () => handleDelete(row.original.id),
              })
            }
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

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
          <h1 className="text-2xl font-bold">News Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage news articles</p>
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
            CREATE NEW ARTICLE
          </Button>
        )}
      </div>

      {/* Create / Edit Form */}
      {(isCreating || editingId) && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Article" : "Create New Article"}
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Article title"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
                {fieldErrors.title && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.title}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Summary</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  placeholder="Brief summary (optional)"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
                {fieldErrors.summary && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.summary}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  placeholder="Article content"
                  rows={8}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
                {fieldErrors.content && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.content}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
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
                  Published
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-[#1a5c2a] hover:bg-[#144a22]"
                  onClick={editingId ? handleUpdate : handleCreate}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Update Article" : "Create Article"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
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
              No news articles yet. Create your first article!
            </div>
          ) : (
            <DataTable columns={newsColumns} data={news} enablePagination enableSorting pageSize={10} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
