"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventService, CreateEventData } from "@/services/event.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  eventDate: z.string().min(1, "Event date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  minParticipants: z.number().min(0, "Must be at least 0"),
  maxParticipants: z.number().min(1, "Must be at least 1"),
});

type CreateEventInput = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
  const [isLoading, setIsLoading] = useState(false);
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
    },
  });

  const onSubmit = async (data: CreateEventInput) => {
    setIsLoading(true);
    try {
      const response = await eventService.create({
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        deadline: new Date(data.deadline).toISOString(),
      });
      if (response.code === 201) {
        router.push("/admin/events");
      }
    } catch (err) {
      console.error("Failed to create event:", err);
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
