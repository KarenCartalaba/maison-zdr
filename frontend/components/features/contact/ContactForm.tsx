"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactService } from "@/services/contact.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must be at most 1000 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onBlur",
  });

  const handleSubmit = async (data: ContactValues) => {
    setIsLoading(true);
    try {
      await contactService.send(data);
      setIsSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: { path: string; message: string }) => {
          const fieldName = err.path.replace("body.", "") as keyof ContactValues;
          if (fieldName in form.getValues()) {
            form.setError(fieldName, { type: "server", message: err.message });
          }
        });
      } else {
        toast.error(error.message || "Failed to send message");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle2 className="h-12 w-12 text-[#1a5c2a] mx-auto" />
        <h3 className="text-lg font-semibold">Message Sent!</h3>
        <p className="text-sm text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you soon.</p>
        <Button variant="outline" onClick={() => { setIsSubmitted(false); form.reset(); }}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-name">Name</FieldLabel>
              <Input {...field} id="contact-name" placeholder="Your name" autoComplete="name" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <Input {...field} id="contact-email" type="email" placeholder="Your email" autoComplete="email" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea {...field} id="contact-message" placeholder="Your message..." rows={5} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" className="w-full bg-[#1a5c2a] hover:bg-[#144a22]" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Message"}
      </Button>
    </form>
  );
}
