'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CalendarEvent } from '@/types';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (date: Date) => void;
  spaceId: string;
}

export default function CalendarView({ events, onAddEvent }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const removeEvent = useSpaceStore((s) => s.removeEvent);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = getDay(monthStart);
  const paddingDays = Array.from({ length: startPadding });

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.starts_at), day));
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  async function handleDelete(eventId: string) {
    try {
      await api.events.delete(eventId);
      removeEvent(eventId);
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  }

  return (
    <div className="space-y-5">
      {/* Calendar card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#fff',
          border: '1px solid oklch(0.88 0.015 68)',
          boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 4%), 0 4px 16px oklch(0.22 0.03 52 / 5%)',
        }}
      >
        {/* Month navigation */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid oklch(0.90 0.012 68)' }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="w-8 h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3
            className="font-display font-700 text-base"
            style={{ color: 'oklch(0.22 0.03 52)' }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="w-8 h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div
          className="grid grid-cols-7"
          style={{ borderBottom: '1px solid oklch(0.92 0.012 68)' }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="text-center font-display text-xs font-600 py-2.5"
              style={{ color: 'oklch(0.60 0.025 58)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {paddingDays.map((_, i) => (
            <div
              key={`pad-${i}`}
              className="min-h-[80px]"
              style={{ borderBottom: '1px solid oklch(0.93 0.010 68)', borderRight: '1px solid oklch(0.93 0.010 68)' }}
            />
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[80px] p-1.5 cursor-pointer transition-colors group relative',
                )}
                style={{
                  borderBottom: '1px solid oklch(0.93 0.010 68)',
                  borderRight: '1px solid oklch(0.93 0.010 68)',
                  background: isSelected ? '#FEF3EF' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.background = 'oklch(0.96 0.009 70)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }
                }}
                onClick={() => setSelectedDay(isSelected ? null : day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-display text-xs w-6 h-6 flex items-center justify-center rounded-full font-500"
                    style={{
                      background: isToday ? '#D4654A' : 'transparent',
                      color: isToday
                        ? '#fff'
                        : isCurrentMonth
                        ? 'oklch(0.30 0.03 52)'
                        : 'oklch(0.70 0.02 68)',
                      fontWeight: isToday ? 700 : 500,
                    }}
                  >
                    {format(day, 'd')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent(day);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                    style={{ color: 'oklch(0.55 0.025 58)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#FEF3EF';
                      (e.currentTarget as HTMLButtonElement).style.color = '#D4654A';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'oklch(0.55 0.025 58)';
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="font-display text-[10px] rounded px-1 py-0.5 truncate font-600"
                      style={{
                        backgroundColor: `${event.color}22`,
                        color: event.color,
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div
                      className="font-display text-[10px] pl-1"
                      style={{ color: 'oklch(0.55 0.025 58)' }}
                    >
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: '#fff',
            border: '1px solid oklch(0.88 0.015 68)',
            boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 4%)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4
              className="font-display font-700 text-sm"
              style={{ color: 'oklch(0.22 0.03 52)' }}
            >
              {format(selectedDay, 'EEEE, MMMM d')}
            </h4>
            <button
              onClick={() => onAddEvent(selectedDay)}
              className="flex items-center gap-1.5 font-display text-xs font-600 px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#D4654A', background: '#FEF3EF' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add event
            </button>
          </div>
          {selectedDayEvents.length === 0 ? (
            <p
              className="font-editorial text-sm"
              style={{ color: 'oklch(0.55 0.025 58)', fontStyle: 'italic' }}
            >
              No events this day
            </p>
          ) : (
            <div className="space-y-2.5">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-xl group transition-all"
                  style={{
                    background: 'oklch(0.97 0.006 70)',
                    border: '1px solid oklch(0.90 0.012 68)',
                  }}
                >
                  <div
                    className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-display font-600 text-sm"
                      style={{ color: 'oklch(0.22 0.03 52)' }}
                    >
                      {event.title}
                    </p>
                    {event.description && (
                      <p
                        className="font-editorial text-xs mt-0.5"
                        style={{ color: 'oklch(0.50 0.025 58)' }}
                      >
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p
                        className="font-display text-xs mt-0.5"
                        style={{ color: 'oklch(0.60 0.02 68)' }}
                      >
                        📍 {event.location}
                      </p>
                    )}
                    <p
                      className="font-display text-xs mt-1"
                      style={{ color: 'oklch(0.60 0.025 58)' }}
                    >
                      {format(new Date(event.starts_at), 'h:mm a')}
                      {event.ends_at && ` – ${format(new Date(event.ends_at), 'h:mm a')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg shrink-0"
                    style={{ color: 'oklch(0.55 0.22 25)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.65 0.22 25 / 12%)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
