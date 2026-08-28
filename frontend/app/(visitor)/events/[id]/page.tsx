import EventDetailHero from "@/components/features/events/EventDetailHero";
import RegistrationSidebar from "@/components/features/events/RegistrationSidebar";
import GalleryGrid from "@/components/features/events/GalleryGrid";
import ReviewSection from "@/components/features/events/ReviewSection";

// TODO: Fetch event data from API based on params.id
// This is a placeholder for now
async function getEvent(id: string) {
  return {
    id,
    title: "Cocktail Night",
    description:
      "A Cocktail Night is a social event where people gather to enjoy drinks (cocktails or mocktails), music, food, and conversation in a relaxed, elegant atmosphere. It's often held for networking, celebrating, or simply spending time with friends and colleagues.",
    location: "9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes",
    eventDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(),
    maxParticipants: 20,
    imageUrl: "/images/event-2.jpg",
    isCancelled: false,
    status: "Ongoing",
    author: { id: "1", name: "Maison ZDR Events Team" },
    _count: { registrations: 17 },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  const isDeadlinePassed = new Date(event.deadline) < new Date();

  return (
    <>
      <EventDetailHero title={event.title} imageUrl={event.imageUrl} />

      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date, Time, Venue pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                <span className="text-muted-foreground">Venue</span>
                <span className="font-medium">
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* About */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About this Event</h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Organizer */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-medium">O</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Organizer</p>
                  <p className="font-medium">{event.author.name}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Official Event Organizer</span>
            </div>

            {/* Gallery */}
            <GalleryGrid />

            {/* Reviews */}
            <ReviewSection />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RegistrationSidebar
                eventId={event.id}
                maxParticipants={event.maxParticipants}
                registeredCount={event._count.registrations}
                status={event.status}
                isDeadlinePassed={isDeadlinePassed}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
