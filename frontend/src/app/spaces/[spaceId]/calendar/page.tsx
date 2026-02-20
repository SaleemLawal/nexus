'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-700 text-xl" style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}>
          Calendar
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-600 text-sm text-white transition-all hover:opacity-90"
          style={{ background: '#D4654A', boxShadow: '0 2px 8px #D4654A33' }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Event
        </button>
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
