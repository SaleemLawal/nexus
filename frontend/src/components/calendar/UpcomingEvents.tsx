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
    <div
      className="rounded-2xl p-5"
      style={{
        background: '#fff',
        border: '1px solid oklch(0.88 0.015 68)',
        boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 4%)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-display font-700 text-sm"
          style={{ color: 'oklch(0.22 0.03 52)' }}
        >
          Upcoming
        </h3>
        <Link
          href={`/spaces/${spaceId}/calendar`}
          className="flex items-center gap-0.5 font-display text-xs font-600 transition-colors"
          style={{ color: '#D4654A' }}
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
            style={{ background: '#FEF3EF' }}
          >
            <Calendar className="w-5 h-5" style={{ color: '#D4654A88' }} />
          </div>
          <p
            className="font-editorial text-xs"
            style={{ color: 'oklch(0.55 0.025 58)', fontStyle: 'italic' }}
          >
            No upcoming events
          </p>
          <Link
            href={`/spaces/${spaceId}/calendar`}
            className="font-display text-xs font-600 mt-2 hover:underline"
            style={{ color: '#D4654A' }}
          >
            Add one
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((event) => {
            const start = new Date(event.starts_at);
            return (
              <div key={event.id} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: event.color }}
                >
                  <span className="font-display text-[8px] font-700 leading-none opacity-80 uppercase tracking-wide">
                    {format(start, 'MMM')}
                  </span>
                  <span className="font-display text-sm font-800 leading-none">
                    {format(start, 'd')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-display font-600 text-sm truncate"
                    style={{ color: 'oklch(0.22 0.03 52)' }}
                  >
                    {event.title}
                  </p>
                  <p
                    className="font-display text-xs"
                    style={{ color: 'oklch(0.55 0.025 58)' }}
                  >
                    {isToday(start) ? 'Today' : format(start, 'EEE')},{' '}
                    {format(start, 'h:mm a')}
                  </p>
                  {event.location && (
                    <p
                      className="font-display text-xs truncate"
                      style={{ color: 'oklch(0.65 0.02 68)' }}
                    >
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
