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
import type { Poll } from '@/types';

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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Polls</h2>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Poll
        </Button>
      </div>

      {polls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-border/50">
          <BarChart3 className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm font-medium">No polls yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1 mb-4">
            Create a poll to vote on decisions together
          </p>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Create Poll
          </Button>
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
