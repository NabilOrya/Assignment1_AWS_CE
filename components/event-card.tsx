'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Event } from '@/lib/ticketmaster';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/event/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3C/svg%3E';
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category Badge */}
          <Badge variant="secondary" className="w-fit mb-2 text-xs">
            {event.category}
          </Badge>

          {/* Title */}
          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
            {event.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-foreground/60 mb-4 line-clamp-2 flex-1">
            {event.description}
          </p>

          {/* Meta Info */}
          <div className="space-y-2 text-sm">
            {/* Date & Time */}
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-foreground/50 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-foreground/70">{formattedDate}</span>
                <span className="text-foreground/50 text-xs">{event.time}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-foreground/50 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-foreground/70">{event.venue}</span>
                <span className="text-foreground/50 text-xs">{event.location}</span>
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-foreground/50" />
              <span className="text-foreground/70">{event.attendees.toLocaleString()} attendees</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
