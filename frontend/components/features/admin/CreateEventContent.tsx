"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventService, CreateEventData } from "@/services/event.service";
import { galleryService } from "@/services/gallery.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  eventDate: z.string().min(1, "Event date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  minParticipants: z.number().min(0, "Must be at least 0"),
  maxParticipants: z.number().min(1, "Must be at least 1"),
  eventType: z.enum(["FORMAL", "CASUAL", "SOCIAL", "WORKSHOP", "LIVE_MUSIC", "FOOD_AND_DRINK", "TRIVIA", "PRIVATE"]),
});

type CreateEventInput = z.infer<typeof createEventSchema>;

export default function CreateEventContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      minParticipants: 0,
      maxParticipants: 100,
      eventType: "SOCIAL" as const,
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: CreateEventInput) => {
    setIsLoading(true);
    try {
      let gallery: string[] = [];
      if (coverImage) {
        try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(coverImage);
          });
          const uploadRes = await galleryService.upload({ imageBase64: base64, folder: "events" });
          if (uploadRes.data?.url) {
            gallery = [uploadRes.data.url];
          }
        } catch (uploadErr: any) {
          toast.error(uploadErr.response?.data?.message || "Failed to upload image");
          return;
        }
      }
      const response = await eventService.create({
        ...data,
        gallery,
        eventDate: new Date(data.eventDate).toISOString(),
        deadline: new Date(data.deadline).toISOString(),
      });
      if (response.code === 201) {
        toast.success("Event created successfully");
        router.push("/admin/events");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Event</h1>
        <p className="text-muted-foreground mt-2">Add a new event</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image</label>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#1a5c2a] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                  </>
                )}
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="eventType" className="text-sm font-medium">
                Event Type
              </label>
              <select
                id="eventType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("eventType")}
              >
                <option value="FORMAL">Formal</option>
                <option value="CASUAL">Casual</option>
                <option value="SOCIAL">Social</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="LIVE_MUSIC">Live Music</option>
                <option value="FOOD_AND_DRINK">Food & Drink</option>
                <option value="TRIVIA">Trivia</option>
                <option value="PRIVATE">Private</option>
              </select>
              {errors.eventType && (
                <p className="text-sm text-red-500">{errors.eventType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input id="location" {...register("location")} />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="eventDate" className="text-sm font-medium">
                  Event Date
                </label>
                <Input id="eventDate" type="datetime-local" {...register("eventDate")} />
                {errors.eventDate && (
                  <p className="text-sm text-red-500">{errors.eventDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium">
                  Registration Deadline
                </label>
                <Input id="deadline" type="datetime-local" {...register("deadline")} />
                {errors.deadline && (
                  <p className="text-sm text-red-500">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="minParticipants" className="text-sm font-medium">
                  Min Participants
                </label>
                <Input
                  id="minParticipants"
                  type="number"
                  {...register("minParticipants", { valueAsNumber: true })}
                />
                {errors.minParticipants && (
                  <p className="text-sm text-red-500">{errors.minParticipants.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="maxParticipants" className="text-sm font-medium">
                  Max Participants
                </label>
                <Input
                  id="maxParticipants"
                  type="number"
                  {...register("maxParticipants", { valueAsNumber: true })}
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-red-500">{errors.maxParticipants.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
