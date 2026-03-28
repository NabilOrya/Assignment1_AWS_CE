'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Event } from '@/lib/ticketmaster';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Share2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        const data = await response.json();
        
        setInstanceId(data.metadata.instanceId);

        if (data.success) {
          const foundEvent = data.events.find((e: Event) => e.id === eventId);
          if (foundEvent) {
            setEvent(foundEvent);
            console.log('[EventDetails] Event loaded:', foundEvent.name);
          } else {
            setError('Event not found');
          }
        } else {
          setError(data.error || 'Failed to load event');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        console.error('[EventDetails] Error:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleShare = async () => {
    if (!event) return;
    
    const text = `Check out ${event.name} on UniEvent!\n${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: text,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-foreground/60">Loading event details...</p>
          </div>
        </main>
        <Footer instanceId={instanceId} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-6xl">⚠️</div>
            <p className="text-lg font-semibold text-foreground">Event Not Found</p>
            <p className="text-foreground/60">{error || 'This event could not be loaded.'}</p>
            <Link href="/">
              <Button>Return to Homepage</Button>
            </Link>
          </div>
        </main>
        <Footer instanceId={instanceId} />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        {/* Event Image */}
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-8 bg-muted">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3C/svg%3E';
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Category & Title */}
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3">
                {event.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {event.name}
              </h1>
              <p className="text-lg text-foreground/60">
                {event.description}
              </p>
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              {/* Date & Time */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-foreground/50 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Date & Time</h3>
                  <p className="text-foreground/60">{formattedDate}</p>
                  <p className="text-foreground/60">{event.time}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-foreground/50 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Location</h3>
                  <p className="text-foreground/60">{event.venue}</p>
                  <p className="text-sm text-foreground/40">{event.location}</p>
                </div>
              </div>

              {/* Attendees */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-foreground/50 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Attendees</h3>
                  <p className="text-foreground/60">{event.attendees.toLocaleString()} people attending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Share Button */}
              <Button
                onClick={handleShare}
                size="lg"
                className="w-full gap-2"
                variant="default"
              >
                <Share2 className="h-4 w-4" />
                Share Event
              </Button>

              {/* Event Summary Card */}
              <div className="border border-border rounded-lg p-6 bg-card space-y-4">
                <h3 className="font-semibold text-foreground">Event Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/60">Category</span>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/60">Date</span>
                    <span className="text-sm font-medium text-foreground">{formattedDate}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/60">Time</span>
                    <span className="text-sm font-medium text-foreground">{event.time}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/60">Capacity</span>
                    <span className="text-sm font-medium text-foreground">{event.attendees.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Link href="/upload">
                    <Button variant="outline" className="w-full">
                      Upload Related Event
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer instanceId={instanceId} />
    </div>
  );
}
