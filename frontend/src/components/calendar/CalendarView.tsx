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

  // Padding for day-of-week offset
  const startPadding = getDay(monthStart); // 0=Sun
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
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-base font-semibold text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[80px] border-border/20 border-b border-r" />
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
                  'min-h-[80px] p-1.5 border-b border-r border-border/20 cursor-pointer transition-colors group relative',
                  isSelected ? 'bg-primary/10' : 'hover:bg-secondary/30',
                )}
                onClick={() => setSelectedDay(isSelected ? null : day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium',
                      isToday
                        ? 'bg-primary text-primary-foreground'
                        : isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground/40',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent(day);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-[10px] rounded px-1 py-0.5 truncate font-medium"
                      style={{
                        backgroundColor: `${event.color}33`,
                        color: event.color,
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
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
        <div className="glass rounded-2xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">
              {format(selectedDay, 'EEEE, MMMM d')}
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddEvent(selectedDay)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3.5 h-3.5" />
              Add event
            </Button>
          </div>
          {selectedDayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events this day</p>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 transition-colors group"
                >
                  <div
                    className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">📍 {event.location}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {format(new Date(event.starts_at), 'h:mm a')}
                      {event.ends_at && ` – ${format(new Date(event.ends_at), 'h:mm a')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0"
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
