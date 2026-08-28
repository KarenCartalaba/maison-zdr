import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Zone de Rassemblement
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Your centralized platform for event registration and management.
              Discover events, register, and stay connected with your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="gap-2">
                  Browse Events <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Use Zone de Rassemblement?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Discover Events</h3>
              <p className="text-muted-foreground">
                Browse through a wide variety of events happening in your community.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Registration</h3>
              <p className="text-muted-foreground">
                Register for events with just a few clicks. Bring a plus-one if allowed.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
              <MapPin className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-muted-foreground">
                Receive email notifications for event updates and registration confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join our community and start registering for events today.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
