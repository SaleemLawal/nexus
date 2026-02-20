'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useSpaceStore } from '@/stores/spaceStore';
import PollCard from '@/components/polls/PollCard';
import CreatePollModal from '@/components/polls/CreatePollModal';
import { supabase } from '@/lib/supabase';

export default function PollsPage() {
  const params = useParams<{ spaceId: string }>();
  const { spaceId } = params;
  const user = useUserStore((s) => s.user);
  const { polls, fetchPolls, updatePoll } = useSpaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchPolls(spaceId);

    const channel = supabase
      .channel(`polls:${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
        },
        () => {
          // Refresh all polls on any vote change
          fetchPolls(spaceId);
        },
      )
      .subscribe();

    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [user, spaceId, fetchPolls, updatePoll]);

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-700 text-xl" style={{ color: 'oklch(0.22 0.03 52)', letterSpacing: '-0.01em' }}>
          Polls
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-600 text-sm text-white transition-all hover:opacity-90"
          style={{ background: '#D4654A', boxShadow: '0 2px 8px #D4654A33' }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Poll
        </button>
      </div>

      {polls.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
          style={{
            background: '#fff',
            border: '1px solid oklch(0.88 0.015 68)',
            boxShadow: '0 2px 8px oklch(0.22 0.03 52 / 4%)',
          }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: '#FEF3EF' }}>
            <BarChart3 className="w-6 h-6" style={{ color: '#D4654A88' }} />
          </div>
          <p className="font-display font-600 text-sm" style={{ color: 'oklch(0.30 0.03 52)' }}>No polls yet</p>
          <p className="font-editorial text-sm mt-1 mb-4" style={{ color: 'oklch(0.55 0.025 58)', fontStyle: 'italic' }}>
            Create a poll to vote on decisions together
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-600 text-sm text-white transition-all hover:opacity-90"
            style={{ background: '#D4654A' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Poll
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} currentUserId={user?.id} />
          ))}
        </div>
      )}

      <CreatePollModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        spaceId={spaceId}
      />
    </div>
  );
}
