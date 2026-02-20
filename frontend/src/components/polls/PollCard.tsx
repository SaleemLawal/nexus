'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import type { Poll } from '@/types';
import { api } from '@/lib/api';
import { useSpaceStore } from '@/stores/spaceStore';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface PollCardProps {
  poll: Poll;
  currentUserId?: string;
}

export default function PollCard({ poll, currentUserId }: PollCardProps) {
  const updatePoll = useSpaceStore((s) => s.updatePoll);
  const [loading, setLoading] = useState<string | null>(null);

  const isClosed = poll.closes_at ? new Date(poll.closes_at) < new Date() : false;
  const totalVotes = poll.options.reduce((sum, o) => sum + o.vote_count, 0);

  async function handleVote(optionId: string, alreadyVoted: boolean) {
    if (isClosed || loading) return;
    setLoading(optionId);
    try {
      let updated: Poll;
      if (alreadyVoted) {
        updated = await api.polls.unvote(poll.id, optionId);
      } else {
        updated = await api.polls.vote(poll.id, optionId);
      }
      updatePoll(updated);
    } catch {
      toast.error('Failed to vote');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 border border-border/50">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-semibold text-foreground text-base leading-snug flex-1">
          {poll.question}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {poll.is_multi_select && (
            <Badge variant="secondary" className="text-xs">Multi-select</Badge>
          )}
          {isClosed && (
            <Badge variant="destructive" className="text-xs">Closed</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {poll.options.map((option) => {
          const pct = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
          const isVoting = loading === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id, option.user_voted)}
              disabled={isClosed || isVoting}
              className={`w-full relative rounded-xl overflow-hidden border transition-all duration-200 text-left ${
                option.user_voted
                  ? 'border-primary/60 bg-primary/10'
                  : 'border-border/50 hover:border-primary/40 hover:bg-secondary/50'
              } ${isClosed ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Background progress bar */}
              <motion.div
                className={`absolute inset-y-0 left-0 ${
                  option.user_voted ? 'bg-primary/20' : 'bg-secondary/40'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />

              <div className="relative flex items-center justify-between px-4 py-3 z-10">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      option.user_voted
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/50'
                    }`}
                  >
                    {option.user_voted && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-sm ${option.user_voted ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
                    {option.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{pct}%</span>
                  <span className="text-muted-foreground/60">({option.vote_count})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          {poll.creator && (
            <span>by {poll.creator.display_name}</span>
          )}
          {poll.closes_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {isClosed ? 'Closed' : `Closes ${formatDate(poll.closes_at)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
