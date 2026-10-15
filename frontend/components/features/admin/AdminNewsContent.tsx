"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { newsService, CreateNewsData } from "@/services/news.service";
import { galleryService } from "@/services/gallery.service";
import { downscaleImage } from "@/lib/image";
import { isValidImageFile } from "@/lib/utils";
import { getErrorMessage, getFieldErrors } from "@/lib/server-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, X, Save, ImagePlus, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the raw input into `appliedSearch`, the value the table filter reads.
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setAppliedSearch(value);
      setIsSearching(false);
      searchTimer.current = null;
    }, 400);
  };

  // Client-side filter: title, excerpt (summary) or body content.
  const filteredNews = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();
    if (!term) return news;
    return news.filter((item) =>
      [item.title, item.summary ?? "", item.content ?? ""].some((field) =>
        field.toLowerCase().includes(term)
      )
    );
  }, [news, appliedSearch]);

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

  // Image upload state. `imageDataUrl` holds the (downscaled) local file that
  // still needs uploading; `imagePreview` shows either that local file or the
  // article's existing remote URL. `formData.imageUrl` stays the stored URL.
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const updateField = (field: keyof CreateNewsData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clearImage = () => {
    setImageDataUrl(null);
    setImagePreview(null);
    updateField("imageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires a change event.
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t.adminNews.imageTooLarge);
      return;
    }
    if (!isValidImageFile(file)) {
      toast.error(t.adminNews.invalidFormat);
      return;
    }
    try {
      // Shared downscale helper: multi-MB camera originals become a <1MB
      // data URL, so both the preview and the /api proxy payload stay small.
      const dataUrl = await downscaleImage(file);
      setImageDataUrl(dataUrl);
      setImagePreview(dataUrl);
      setFieldErrors((prev) => {
        if (!("imageUrl" in prev)) return prev;
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } catch {
      toast.error(t.adminNews.uploadError);
    }
  };

  /**
   * Uploads a freshly picked file (only at submit time, so cancelling the form
   * never leaves an orphan image) and returns the URL to store on the article.
   * Returns the untouched `formData.imageUrl` when nothing new was picked.
   */
  const resolveImageUrl = async (): Promise<string> => {
    if (!imageDataUrl) return formData.imageUrl ?? "";
    setIsUploading(true);
    try {
      // Same-origin relative /api path via the shared axios instance; the
      // gallery service downscales again (no-op for our already-small payload).
      const response = await galleryService.upload({
        imageBase64: imageDataUrl,
        folder: "news",
      });
      if (!response.data?.url) throw new Error("Upload returned no URL");
      return response.data.url;
    } finally {
      setIsUploading(false);
    }
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

  // Drop the pending debounce tick on unmount.
  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
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
    setImageDataUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) return;
    setFieldErrors({});
    let imageUrl = formData.imageUrl ?? "";
    try {
      imageUrl = await resolveImageUrl();
    } catch (err) {
      toast.error(getErrorMessage(err, t.adminNews.uploadError));
      return;
    }
    try {
      const response = await newsService.create({ ...formData, imageUrl });
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
    // Show the stored image as-is; a newly picked file replaces it on submit.
    setImagePreview(item.imageUrl || null);
    setImageDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFieldErrors({});
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.title || !formData.content) return;
    setFieldErrors({});
    let imageUrl = formData.imageUrl ?? "";
    try {
      imageUrl = await resolveImageUrl();
    } catch (err) {
      toast.error(getErrorMessage(err, t.adminNews.uploadError));
      return;
    }
    try {
      const response = await newsService.update({ id: editingId, ...formData, imageUrl });
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
              setImageDataUrl(null);
              setImagePreview(null);
              setFieldErrors({});
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.adminNews.createNew}
          </Button>
        )}
      </div>

      {/* Search — client-side filter over the article table below */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mb-6 max-w-sm">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          placeholder={t.adminNews.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="border-0 bg-transparent outline-none w-full shadow-none focus-visible:ring-0"
        />
        {isSearching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
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
                <label className="text-sm font-medium mb-1 block">
                  {t.adminNews.labelImage}
                </label>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={t.adminNews.labelImage}
                  className="relative flex min-h-[168px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 transition-colors hover:border-[#1a5c2a] hover:bg-[#1a5c2a]/5 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt={t.adminNews.labelImage}
                        className="max-h-56 w-full rounded-lg object-contain"
                      />
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-xs font-medium text-white">
                        <ImagePlus className="h-3.5 w-3.5" />
                        {t.adminNews.changeImage}
                      </span>
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <ImagePlus className="mx-auto mb-2 h-9 w-9 text-muted-foreground" />
                      <p className="text-sm font-medium">{t.adminNews.uploadHint}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.adminNews.uploadFormats}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  {imagePreview ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-600 hover:text-red-700"
                      onClick={clearImage}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      {t.adminNews.removeImage}
                    </Button>
                  ) : (
                    <span />
                  )}
                  {fieldErrors.imageUrl && (
                    <p className="text-sm text-red-600">{fieldErrors.imageUrl}</p>
                  )}
                </div>
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
                  disabled={isUploading}
                  onClick={editingId ? handleUpdate : handleCreate}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingId ? t.adminNews.btnUpdate : t.adminNews.btnCreate}
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={isUploading}>
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
            <DataTable
              columns={newsColumns}
              data={filteredNews}
              emptyContent={
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  {t.adminNews.noMatches}
                </div>
              }
              enablePagination
              enableSorting
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
