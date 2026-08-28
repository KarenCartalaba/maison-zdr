"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, User, Users, ClipboardCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import type { GuestInfo } from "@/types";

const STEPS = [
  { label: "Personal Information", icon: User },
  { label: "Guest Information", icon: Users },
  { label: "Review Informations", icon: ClipboardCheck },
];

export default function RegistrationWizardContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");

  // Step 2: Guests
  const [guests, setGuests] = useState<GuestInfo[]>([]);

  // Step 3: Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const maxGuests = 2;
  const partySize = 1 + guests.length;

  const addGuest = () => {
    if (guests.length < maxGuests) {
      setGuests([...guests, { name: "" }]);
    }
  };

  const removeGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const updateGuestName = (index: number, name: string) => {
    const updated = [...guests];
    updated[index] = { name };
    setGuests(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const code = `ZDR-${eventId.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setReferenceCode(code);
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to register:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Registration Confirmed</p>
              <h2 className="text-2xl font-bold text-[#1a5c2a]">
                You&apos;re on the list for Cocktail Night.
              </h2>
            </div>

            <div className="rounded-lg border p-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Registration Confirmed</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{referenceCode}</span>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(referenceCode)}>
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Give this reference number at the door and our team will find your registration.
                Keep it handy — no printout needed.
              </p>
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <h3 className="font-semibold text-[#1a5c2a]">Who&apos;s attending</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Registrant</span>
                  <span className="font-medium">{partySize} people</span>
                </div>
                {guests.map((guest, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-muted-foreground">Guest {i + 1}</span>
                    <span className="font-medium">{guest.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Link href={`/events/${eventId}`} className="flex-1">
                <Button variant="outline" className="w-full">Back to Event</Button>
              </Link>
              <Link href="/my-registrations" className="flex-1">
                <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]">My Registrations</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <Link href={`/events/${eventId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Link>

      <h1 className="text-3xl font-bold mb-2">Event Registration</h1>
      <p className="text-muted-foreground mb-8">Confirm your details below.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                {STEPS.map((step, index) => {
                  const stepNum = index + 1;
                  const isCompleted = currentStep > stepNum;
                  const isCurrent = currentStep === stepNum;
                  return (
                    <div key={stepNum} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        {index > 0 && (
                          <div className={`flex-1 h-0.5 ${isCompleted || isCurrent ? "bg-[#1a5c2a]" : "bg-muted"}`} />
                        )}
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                          isCompleted ? "bg-[#1a5c2a] text-white" : isCurrent ? "bg-[#1a5c2a] text-white" : "border bg-muted"
                        }`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 ${currentStep > stepNum ? "bg-[#1a5c2a]" : "bg-muted"}`} />
                        )}
                      </div>
                      <span className={`text-xs mt-2 text-center ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Personal Information</h2>
                    <p className="text-sm text-muted-foreground">Please provide your details to continue with your event registration.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full bg-[#1a5c2a] hover:bg-[#144a22]" onClick={() => setCurrentStep(2)}>
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Guest Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Guest Information</h2>
                    <p className="text-sm text-muted-foreground">Bringing anyone with you? Add your guests below.</p>
                  </div>

                  {guests.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed p-12 text-center space-y-2">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="font-medium">You&apos;re registering solo.</p>
                      <p className="text-sm text-muted-foreground">Add a guest below, or continue on your own.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {guests.map((guest, index) => (
                        <div key={index} className="rounded-lg border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Guest {index + 1}</h4>
                            <Button variant="ghost" size="icon" onClick={() => removeGuest(index)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Guest Name</label>
                            <Input
                              value={guest.name}
                              onChange={(e) => updateGuestName(index, e.target.value)}
                              placeholder="Enter guest name"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {guests.length < maxGuests ? (
                    <div className="space-y-2">
                      <Button variant="outline" onClick={addGuest}>
                        + Add Guest
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {guests.length === 0 ? `You can add up to ${maxGuests} guests.` : `You can add ${maxGuests - guests.length} more guest${maxGuests - guests.length > 1 ? "s" : ""}.`}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Maximum of {maxGuests} guests reached.</p>
                  )}

                  <div className="border-t pt-4 flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button className="flex-1 bg-[#1a5c2a] hover:bg-[#144a22]" onClick={() => setCurrentStep(3)}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Review Information</h2>
                    <p className="text-sm text-muted-foreground">Please review your information before confirming your registration.</p>
                  </div>

                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Personal Information</h3>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">First Name</span>
                        <span className="font-medium">{firstName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Last Name</span>
                        <span className="font-medium">{lastName}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Guest Information</h3>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Party size</span>
                        <span className="font-medium">{partySize} people</span>
                      </div>
                      {guests.map((guest, i) => (
                        <div key={i} className="flex justify-between py-1 border-b last:border-0">
                          <span className="text-muted-foreground">Guest {i + 1}</span>
                          <span className="font-medium">{guest.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-6 space-y-4">
                    <h3 className="font-semibold">Terms & Conditions</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      By registering for this event, you agree to the following terms:
                      (1) Registration is non-transferable.
                      (2) Cancellations must be made at least 24 hours before the event.
                      (3) Guests are your responsibility and count toward the event&apos;s maximum capacity.
                      (4) Maison ZDR reserves the right to cancel or reschedule events with prior notice.
                      (5) You consent to photography and video recording during the event for promotional purposes.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">
                        I have read and agree to the Terms & Conditions and Privacy Policy of Maison ZDR.
                      </span>
                    </label>
                  </div>

                  <div className="border-t pt-4 flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                    <Button
                      className="flex-1 bg-[#1a5c2a] hover:bg-[#144a22]"
                      disabled={!agreedToTerms || isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="border shadow-md overflow-hidden">
              <div className="aspect-video bg-muted">
                <img
                  src="/images/event-2.jpg"
                  alt="Event"
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Summary</p>
                  <h3 className="text-lg font-bold mt-1">Cocktail Night</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">📅</span>
                    <span>Wednesday 7:00 pm - 10:00pm</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground">📍</span>
                    <span>9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes</span>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Registrant</p>
                      <p className="font-medium">{firstName} {lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Party Size</p>
                      <p className="font-medium">
                        {partySize} person{partySize > 1 ? "s" : ""}
                        {guests.length > 0 && ` — ${guests.length} guest${guests.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Places Remaining</span>
                  <span className="font-bold">7</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
