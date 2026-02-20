'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useSpaceStore } from '@/stores/spaceStore';
import CalendarView from '@/components/calendar/CalendarView';
import CreateEventModal from '@/components/calendar/CreateEventModal';

export default function CalendarPage() {
  const params = useParams<{ spaceId: string }>();
  const { spaceId } = params;
  const user = useUserStore((s) => s.user);
  const { events, fetchEvents } = useSpaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  useEffect(() => {
    if (user) fetchEvents(spaceId);
  }, [user, spaceId, fetchEvents]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Calendar</h2>
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      <CalendarView
        events={events}
        onAddEvent={(date) => {
          setSelectedDate(date);
          setShowCreate(true);
        }}
        spaceId={spaceId}
      />

      <CreateEventModal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setSelectedDate(undefined);
        }}
        spaceId={spaceId}
        defaultDate={selectedDate}
      />
    </div>
  );
}
