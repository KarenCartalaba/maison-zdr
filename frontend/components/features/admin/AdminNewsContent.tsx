"use client";

import { useEffect, useState } from "react";
import { newsService, CreateNewsData } from "@/services/news.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
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
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) return;
    try {
      const response = await newsService.create(formData);
      if (response.code === 201 && response.data) {
        setNews([response.data.news, ...news]);
        resetForm();
      }
    } catch (err) {
      console.error("Failed to create news:", err);
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
    try {
      const response = await newsService.update({ id: editingId, ...formData });
      if (response.code === 200 && response.data) {
        setNews(news.map((n) => (n.id === editingId ? response.data!.news : n)));
        resetForm();
      }
    } catch (err) {
      console.error("Failed to update news:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    try {
      const response = await newsService.delete(id);
      if (response.code === 200) {
        setNews(news.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete news:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article title"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Summary</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary (optional)"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Article content"
                  rows={8}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]"
                />
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">TITLE</th>
                  <th className="px-6 py-3 font-medium">AUTHOR</th>
                  <th className="px-6 py-3 font-medium">CREATED</th>
                  <th className="px-6 py-3 font-medium">STATUS</th>
                  <th className="px-6 py-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {news.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No news articles yet. Create your first article!
                    </td>
                  </tr>
                ) : (
                  news.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-6 py-3 font-medium">{item.title}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {item.author?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={item.isPublished ? "outline" : "secondary"}
                          className={
                            item.isPublished
                              ? "text-[#1a5c2a] border-[#1a5c2a]"
                              : "text-muted-foreground"
                          }
                        >
                          {item.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
