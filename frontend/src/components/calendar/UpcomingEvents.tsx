'use client';

import Link from 'next/link';
import { format, isFuture, isToday } from 'date-fns';
import { Calendar, ChevronRight } from 'lucide-react';
import type { CalendarEvent } from '@/types';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  spaceId: string;
}

export default function UpcomingEvents({ events, spaceId }: UpcomingEventsProps) {
  const upcoming = events
    .filter((e) => isToday(new Date(e.starts_at)) || isFuture(new Date(e.starts_at)))
    .slice(0, 5);

  return (
    <div className="glass rounded-2xl border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">Upcoming</h3>
        <Link
          href={`/spaces/${spaceId}/calendar`}
          className="text-xs text-primary hover:underline flex items-center gap-0.5"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No upcoming events</p>
          <Link
            href={`/spaces/${spaceId}/calendar`}
            className="text-xs text-primary hover:underline mt-2"
          >
            Add one
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((event) => {
            const start = new Date(event.starts_at);
            return (
              <div key={event.id} className="flex items-start gap-3 group">
                <div
                  className="w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: event.color }}
                >
                  <span className="text-[9px] font-bold leading-none opacity-80 uppercase">
                    {format(start, 'MMM')}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {format(start, 'd')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isToday(start) ? 'Today' : format(start, 'EEE')},{' '}
                    {format(start, 'h:mm a')}
                  </p>
                  {event.location && (
                    <p className="text-xs text-muted-foreground/60 truncate">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
